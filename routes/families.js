"use strict";

/** Routes for camps. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Family = require("../models/family");

const campUpdateSchema = require("../schemas/campUpdate.json");
const campNewSchema = require("../schemas/campNew.json");

const router = new express.Router();


/** POST / { camp } =>  { camp }
 *
 * person should be {location, city, country}
 *
 * Returns {id, location, city, country}
 *
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, campNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const camp = await Family.create(req.body);
        return res.status(201).json({ camp });
    } catch (err) {
        return next(err);
    }
});


/** GET /  =>
 *   { camps: [ {id, location, city, country}, ...] }
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


/** GET /[id]  =>  { camp }
 *
 *  Camp is {id, location, city, country}
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


/** PATCH /[id] { fld1, fld2, ... } => { camp }
 *
 * Patches camp data.
 *
 * fields can be: {location, city, country}
 *
 * Returns {id, location, city, country}
 *
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, campUpdateSchema);
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


module.exports = router;