"use strict";

/** Routes for people. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Person = require("../models/person");

const personUpdateSchema = require("../schemas/personUpdate.json");
const personNewSchema = require("../schemas/personNew.json");

const router = new express.Router();


/** POST / { person } =>  { person }
 *
 * person should be {first_name, last_name, dob, sex, nid}
 *
 * Returns {id, first_name, last_name, dob, sex, nid}
 *
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, personNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const person = await Person.create(req.body);
        return res.status(201).json({ person: { ...person, dob: `${person.dob.getDate()}-${person.dob.getMonth() + 1}-${person.dob.getFullYear()}`}});
    } catch (err) {
        return next(err);
    }
});


/** GET /  =>
 *   { people: [ {id, first_name, last_name, dob, sex, nid}, ...] }
 *
 * Authorization required: none
 */
router.get("/", ensureAdmin, async function (req, res, next) {

    try {
        const people = await Person.findAll();
        return res.json({ people: people.map(o => ({ ...o, dob: `${o.dob.getDate()}-${o.dob.getMonth() + 1}-${o.dob.getFullYear()}`}))});
    } catch (err) {
        return next(err);
    }
});


/** GET /[id]  =>  { person }
 *
 *  Person is {id, first_name, last_name, dob, sex, nid}
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
    try {
        const person = await Person.get(req.params.id);
        return res.json({ person: { ...person, dob: `${person.dob.getDate()}-${person.dob.getMonth() + 1}-${person.dob.getFullYear()}`} });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] { fld1, fld2, ... } => { person }
 *
 * Patches person data.
 *
 * fields can be: {first_name, last_name, dob, sex, nid}
 *
 * Returns {id, first_name, last_name, dob, sex, nid}
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, personUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const person = await Person.update(req.params.id, req.body);
        return res.json({ person: { ...person, dob: `${person.dob.getDate()}-${person.dob.getMonth() + 1}-${person.dob.getFullYear()}`} });
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
        await Person.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
