"use strict";

/** Routes for families. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Family = require("../models/family");
const Household = require("../models/household");
const Distribution = require("../models/distribution");

const familyUpdateSchema = require("../schemas/familyUpdate.json");
const familyNewSchema = require("../schemas/familyNew.json");

const router = new express.Router();


/** POST / { family } =>  { family }
 *
 * family should be {camp_id, head}
 *
 * Returns {id, camp_id, head}
 *
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, familyNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const family = await Family.create(req.body);
        return res.status(201).json({ family });
    } catch (err) {
        return next(err);
    }
});


/** GET /  =>
 *   { families: [ {id, camp_id, head}, ...] }
 *
 * Authorization required: admin
 */
router.get("/", ensureAdmin, async function (req, res, next) {

    try {
        const families = await Family.findAll();
        return res.json({ families });
    } catch (err) {
        return next(err);
    }
});


router.get("/household", ensureAdmin, async function (req, res, next) {
    const householdRes = await Household.all();
    return res.json({ householdAll: householdRes });
});

/** GET /[id]  =>  { family }
 *
 * Family is {id, camp_id, head}
 *
 * Authorization required: admin
 */
router.get("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const family = await Family.get(req.params.id);
        return res.json({ family });
    } catch (err) {
        return next(err);
    }
});


/** PATCH /[id] { fld1, fld2, ... } => { family }
 *
 * Patches family data.
 *
 * fields can be: {camp_id, head}
 *
 * Returns {id, camp_id, head}
 *
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, familyUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const camp = await Family.update(req.params.id, req.body);
        return res.json({ camp });
    } catch (err) {
        return next(err);
    }
});


/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */
router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Family.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});


/* CREATE /[fID]/people/[pID] => { household }
*
* Household is { family_id, person_id }
*
* Authorization required: admin
*/
router.post("/:fID/people/:pID", ensureAdmin, async function (req, res, next) {
    try {
        const { fID, pID } = req.params;
        const household = await Household.create(+fID, +pID);
        return res.json({ household });
    } catch (e) {
        return next(e);
    }
});


/** GET /[id]/people  =>  { household }
 *
 * Household is [{family_id, person_id}, ...]
 *
 * Authorization required: admin
 */
router.get("/:id/people", ensureAdmin, async function (req, res, next) {
    try {
        const { id } = req.params;
        const household = await Household.get(+id);
        return res.json({ household });
    } catch (e) {
        return next(e);
    }
});


/* GET /[id]/donations => { donations }
*
* Donations is [{id, start_date, end_date, target, description}, ...]
*
* Authorization required: admin
*/
router.get("/:id/donations", ensureAdmin, async function (req, res, next) {
    try {
        const { id } = req.params;
        const donations = await Family.getAllNewDonations(+id);
        return res.json({donations});
    } catch (e) {
        return next(e);
    }
});


router.post("/:fID/donations/:dID", ensureAdmin, async function (req, res, next) {
    try {
        const { fID, dID } = req.params;
        const distribution = await Distribution.create({ family_id: +fID, donation_id: +dID });
        return res.json({distribution});
    } catch (e) {
        return next(e);
    }
});


module.exports = router;
