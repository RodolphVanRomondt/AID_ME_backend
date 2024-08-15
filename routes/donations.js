"use strict";

/** Routes for donations. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Donation = require("../models/donation");

const donationUpdateSchema = require("../schemas/donationUpdate.json");
const donationNewSchema = require("../schemas/donationNew.json");

const router = new express.Router();


/** POST / { donation } =>  { donation }
 *
 * person should be {start_date, end_date, target, description}
 *
 * Returns {id, start_date, end_date, target, description}
 *
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, donationNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const donation = await Donation.create(req.body);
        return res.status(201).json({
            donation: {
                ...donation,
                start_date: `${donation.start_date.getDate()}-${donation.start_date.getMonth() + 1}-${donation.start_date.getFullYear()}`,
                end_date: `${donation.end_date.getDate()}-${donation.end_date.getMonth() + 1}-${donation.end_date.getFullYear()}`
            }});
    } catch (err) {
        return next(err);
    }
});


/** GET /  =>
 *   { donations: [ {id, start_date, end_date, target, description}, ...] }
 *
 * Authorization required: admin
 */
router.get("/", ensureAdmin, async function (req, res, next) {

    try {
        const donations = await Donation.findAll();
        return res.json({
            donations: donations.map(o => ({
                ...o,
                start_date: `${o.start_date.getDate()}-${o.start_date.getMonth() + 1}-${o.start_date.getFullYear()}`,
                end_date: `${o.end_date.getDate()}-${o.end_date.getMonth() + 1}-${o.end_date.getFullYear()}`
            }))
        });
    } catch (err) {
        return next(err);
    }
});


/** GET /[id]  =>  { donation }
 *
 *  Donation is {id, start_date, end_date, target, description}
 *
 * Authorization required: admin
 */
router.get("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const donation = await Donation.get(req.params.id);
        return res.json({
            donation: {
                ...donation,
                start_date: `${donation.start_date.getDate()}-${donation.start_date.getMonth() + 1}-${donation.start_date.getFullYear()}`,
                end_date: `${donation.end_date.getDate()}-${donation.end_date.getMonth() + 1}-${donation.end_date.getFullYear()}`
            }
        });
    } catch (err) {
        return next(err);
    }
});


/** PATCH /[id] { fld1, fld2, ... } => { donation }
 *
 * Patches donation data.
 *
 * fields can be: {start_date, end_date, target, description}
 *
 * Returns {id, start_date, end_date, target, description}
 *
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, donationUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const donation = await Donation.update(req.params.id, req.body);
        return res.json({
            donation: {
                ...donation,
                start_date: `${donation.start_date.getDate()}-${donation.start_date.getMonth() + 1}-${donation.start_date.getFullYear()}`,
                end_date: `${donation.end_date.getDate()}-${donation.end_date.getMonth() + 1}-${donation.end_date.getFullYear()}`
            } });
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
        await Donation.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
