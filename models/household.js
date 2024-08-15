"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for household. */
class Household {

    /* Add person to family in the household table.
    *
    * data should be { family_id, person_id }
    * 
    * Returns {family_id, person_id}
    * 
    * Throws BadRequestError if data violate foreign key constraing or is duplicate.
    */
    static async create(family_id, person_id) {
        const duplicate = await db.query(
            `SELECT person_id FROM household
            WHERE person_id = $1`, [person_id]);

        if (duplicate.rows.length) throw new BadRequestError("Already in household.");

        try {
            const result = await db.query(
                `INSERT INTO household (family_id, person_id)
                VALUES ($1, $2)
                RETURNING family_id, person_id`,
                [family_id, person_id]);

            return result.rows[0];
        } catch (e) {
            throw new BadRequestError("Duplicate/Not Present");
        }
    }


    /** Get all household.
     *
     * Returns [{ id }, ...]
     * */
    static async all() {
        const { rows } = await db.query(
            `SELECT id FROM people WHERE id NOT IN (SELECT person_id FROM household)`
        );

        const people = []
        for (let i of rows) {
            let res = await db.query(
                `SELECT * FROM people WHERE id = ${i.id}`
            );
            people.push(res.rows[0]);
        }

        return people;
    } 


    /** Find household by family ID.
     *
     * Returns [{ family_id, person_id }, ...]
     * */
    static async get(fID) {
        const {rows} = await db.query(
            `SELECT * FROM household
            WHERE family_id = $1`, [fID]);
        
        if (!rows.length) throw new NotFoundError(`No household with family ID ${id}`);

        return rows;
    }


    /** Delete given family/person association from database; returns undefined.
     *
     * Throws NotFoundError if association not found.
     **/
    // static async remove(fID, pID) {
    //     const result = await db.query(
    //         `DELETE
    //        FROM household
    //        WHERE family_id = $1 AND person_id = $2 
    //        RETURNING family_id, person_id`, [fID, pID]);
    //     const household = result.rows[0];

    //     if (!household) throw new NotFoundError(`No household with family ID ${fID} and person Id ${pID}.`);
    // }
}


module.exports = Household;
