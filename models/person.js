"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for people. */
class Person {

    /** Create a person (from data), update db, return new person data.
     *
     * data should be {first_name, last_name, dob, sex, nid}
     *
     * Returns {id, first_name, last_name, dob, sex, nid}
     *
     * Throws BadRequestError if person already in database.
     * */
    static async create({ first_name, last_name, dob, sex, nid }) {
        const duplicateCheck = await db.query(
            `SELECT * FROM people 
            WHERE first_name = $1 AND last_name = $2 AND dob = $3`,
            [first_name, last_name, dob]);

        if (duplicateCheck.rows[0])
            throw new BadRequestError(`Duplicate person`);

        const result = await db.query(
            `INSERT INTO people
           (first_name, last_name, dob, sex, nid)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, first_name, last_name, dob, sex, nid`,
            [first_name, last_name, dob, sex, nid]);

        return result.rows[0];
    }

    /** Find all people.
     *
     * Returns [{id, first_name, last_name, dob, sex, nid}, ...]
     * */
    static async findAll() {
        let query = `SELECT * FROM people`;

        // Finalize query and return results
        const peopleRes = await db.query(query);
        return peopleRes.rows;
    }


    /** Given a person id, return data about that person.
     *
     * Returns {id, first_name, last_name, dob, sex, nid, family_member}
     *   where family_member is [id_1, id_2, ...]
     *
     * Throws NotFoundError if not found.
     **/
    static async get(id) {
        const personRes = await db.query(
            `SELECT * FROM people WHERE id = $1`, [id]);

        const person = personRes.rows[0];

        if (!person) throw new NotFoundError(`No person with ID ${id}`);

        const familyRes = await db.query(
            `SELECT person_id FROM household 
            WHERE family_id = (SELECT family_id FROM household WHERE person_id = $1);`,
            [id],
        );

        person.family_member = familyRes.rows.map(id => id.person_id).filter(p_id => p_id != id);

        return person;
    }


    /** Update person data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {first_name, last_name, dob, sex, nid}
     *
     * Returns {id, first_name, last_name, dob, sex, nid}
     *
     * Throws NotFoundError if not found.
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {});
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE people 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                first_name,
                                last_name,
                                dob,
                                sex,
                                nid`;
        const result = await db.query(querySql, [...values, id]);
        const person = result.rows[0];

        if (!person) throw new NotFoundError(`No person with id ${id}`);

        return person;
    }


    /** Delete given person from database; returns undefined.
     *
     * Throws NotFoundError if person not found.
     **/
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM people WHERE id = $1 RETURNING id`,
            [id]);

        if (!result.rows[0]) throw new NotFoundError(`No person with ID ${id}`);
    }
}


module.exports = Person;
