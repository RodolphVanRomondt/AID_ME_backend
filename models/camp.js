"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for camps. */
class Camp{

    /** Create a camp (from data), update db, return new camp data.
     *
     * data should be { location, city, country }
     *
     * Returns { id, location, city, country }
     **/
    static async create(data) {
        const duplicateCheck = await db.query(
            `SELECT * FROM camps 
            WHERE location = $1 AND city = $2 AND country = $3`,
            [
                data.location,
                data.city,
                data.country]);

        if (duplicateCheck.rows[0])
            throw new BadRequestError(`Duplicate camp.`);

        const result = await db.query(
            `INSERT INTO camps (location, city, country)
           VALUES ($1, $2, $3)
           RETURNING id, location, city, country`,
            [
                data.location,
                data.city,
                data.country]);
        let camp = result.rows[0];

        return camp;
    }

    /** Find all camps.
     *
     * Returns [{ id, location, city, country }, ...]
     * */
    static async findAll() {
        let query = `SELECT * FROM camps`;

        const campRes = await db.query(query);
        return campRes.rows;
    }


    /** Given a camp id, return data about camp.
     *
     * Returns { id, location, city, country }
     *
     * Throws NotFoundError if not found.
     **/
    static async get(id) {
        const campRes = await db.query(
            `SELECT * FROM camps
           WHERE id = $1`, [id]);

        const camp = campRes.rows[0];

        if (!camp) throw new NotFoundError(`No camp with ID ${id}`);

        const { rows } = await db.query(
            `SELECT * FROM families 
            WHERE camp_id = $1`, [id]);
        
        camp.families = rows.map(e => e.id);

        return camp;
    }


    /** Update camp data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include: { location, city, country }
     *
     * Returns { id, location, city, country }
     *
     * Throws NotFoundError if not found.
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE camps 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, location, city, country`;
        const result = await db.query(querySql, [...values, id]);
        const camp = result.rows[0];

        if (!camp) throw new NotFoundError(`No camp with ID ${id}`);

        return camp;
    }


    /** Delete given camp from database; returns undefined.
     *
     * Throws NotFoundError if camp not found.
     **/
    static async remove(id) {
        const result = await db.query(
            `DELETE
           FROM camps
           WHERE id = $1
           RETURNING id`, [id]);
        const camp = result.rows[0];

        if (!camp) throw new NotFoundError(`No camp with ID ${id}`);
    }
}


module.exports = Camp;
