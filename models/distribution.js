"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for distributions. */
class Distribution {

    /** Create a distribution (from data), update db, return new distribution data.
    *
    * data should be { donation_id, family_id, [receive] }
    *
    * Returns { donation_id, family_id, receive }
    *
    * Throws BadRequestError if key is not present in respective table or already exists.
    */
    static async create(data) {
        try {
            const result = await db.query(
                `INSERT INTO distributions (donation_id, family_id)
                VALUES ($1, $2)
                RETURNING donation_id, family_id, receive`,
                [
                    data.donation_id,
                    data.family_id
                ]);
            return result.rows[0];
        } catch (e) {
            throw new BadRequestError("Duplicate/Not Present");
        }
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

        const { rows } = await db.query(
            `SELECT family_id, receive FROM distributions WHERE donation_id = $1`,
            [id]
        );

        donation.family = rows.map(e => ({ id: e.family_id, receive: e.receive }));

        return donation;
    }


    /** Update distribution.
     *
     * Returns { donation_id, family_id, receive }
     *
     * Throws NotFoundError if not found.
     */
    static async update(data) {
        const result = await db.query(`UPDATE distributions 
                      SET receive = true
                      WHERE donation_id = $1 AND family_id = $2
                      RETURNING donation_id, family_id, receive`, [data.dID, data.fID]);

        const distribution = result.rows[0];

        if (!distribution) throw new NotFoundError(
            `No distribution with donation ID ${dID} and family ID ${fID}`
        );

        return distribution;
    }


    /** Delete given distribution from database; returns undefined.
     *
     * Throws NotFoundError if distribution not found.
     **/
    static async remove(fID, dID) {
        const result = await db.query(
            `DELETE
            FROM distributions
            WHERE donation_id = $1
            AND family_id = $2
            RETURNING id`, [fID, dID]);
        const distribution = result.rows[0];

        if (!distribution) throw new NotFoundError(`No distribution with family ID ${fID} and donation ID ${dID}`);
    }
}


module.exports = Distribution;
