"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for donations. */
class Donation {

    /** Create a donation (from data), update db, return new donation data.
     *
     * data should be { start_date, end_date, target, description }
     *
     * Returns { id, start_date, end_date, target, description }
     **/
    static async create(data) {
        const result = await db.query(
            `INSERT INTO donations (start_date, end_date, target, description)
           VALUES ($1, $2, $3, $4)
           RETURNING id, start_date, end_date, target, description`,
            [
                data.start_date,
                data.end_date,
                data.target,
                data.description]);
        let donation = result.rows[0];

        return donation;
    }


    /** Find all donations.
     *
     * Returns [{ id, start_date, end_date, target, description }, ...]
     * */
    static async findAll() {
        let query = `SELECT * FROM donations`;

        const donationRes = await db.query(query);
        return donationRes.rows;
    }


    /** Given a donation id, return data about donation.
     *
     * Returns { id, start_date, end_date, target, description, family }
     *  where family is [{id, receive}, ...]
     * 
     * Throws NotFoundError if not found.
     **/
    static async get(id) {
        const donationRes = await db.query(
            `SELECT * FROM donations
           WHERE id = $1`, [id]);

        const donation = donationRes.rows[0];

        if (!donation) throw new NotFoundError(`No donation with ID ${id}`);

        const {rows} = await db.query(
            `SELECT family_id, receive FROM distributions WHERE donation_id = $1`,
            [id]
        );

        donation.family = rows.map(e => ({id: e.family_id, receive: e.receive}));

        return donation;
    }


    /** Update donation data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include: { start_date, end_date, target, description }
     *
     * Returns { id, start_date, end_date, target, description }
     *
     * Throws NotFoundError if not found.
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE donations 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, start_date, end_date, target, description`;
        const result = await db.query(querySql, [...values, id]);
        const donation = result.rows[0];

        if (!donation) throw new NotFoundError(`No donation with ID ${id}`);

        return donation;
    }


    /** Delete given donation from database; returns undefined.
     *
     * Throws NotFoundError if donation not found.
     **/
    static async remove(id) {
        const result = await db.query(
            `DELETE
           FROM donations
           WHERE id = $1
           RETURNING id`, [id]);
        const donation = result.rows[0];

        if (!donation) throw new NotFoundError(`No donation with ID ${id}`);
    }
}


module.exports = Donation;
