"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for families. */
class Family {

    /** Create a family (from data), update db, return new family data.
     *
     * data should be { camp_id, head }
     *
     * Throws BadRequestError if input data combination already exist or not found in respective tables.
     * 
     * Returns { id, camp_id, head }
     **/
    static async create(data) {
        const result = await db.query(
            `INSERT INTO families (camp_id, head)
           VALUES ($1, $2)
           RETURNING id, camp_id, head`,
            [
                data.camp_id,
                data.head]);

        let family = result.rows[0];

        if (!family) throw new BadRequestError();

        return family;
    }


    /** Find all families.
     *
     * Returns [{ id, camp_id, head }, ...]
     * */
    static async findAll() {
        let query = `SELECT * FROM families`;

        const familyRes = await db.query(query);
        return familyRes.rows;
    }


    /** Given a family id, return data about family.
     *
     * Returns { id, camp: {camp}, members: [{person}, ...], donation: [{id, receive}, ...] }
     *
     * Throws NotFoundError if not found.
     **/
    static async get(id) {
        const familyRes = await db.query(
            `SELECT * FROM families
           WHERE id = $1`, [id]);

        const family = familyRes.rows[0];

        if (!family) throw new NotFoundError(`No family with ID ${id}`);

        const camp = await db.query(
            `SELECT location, city, country FROM camps WHERE id = $1`,
            [family.camp_id]
        );

        const {rows} = await db.query(
            `SELECT id, first_name, last_name, dob, sex, nid
            FROM household JOIN people ON household.person_id = people.id
            WHERE family_id = $1;`,
            [id]
        );

        for (let i of rows) {
            i.id === family.head ? i.head = "True" : i.head = "False";
            i.dob = `${i.dob.getDate()}-${i.dob.getMonth() + 1}-${i.dob.getFullYear()}`
        }

        const donationRes = await db.query(
            `SELECT donation_id, receive FROM distributions
            WHERE family_id = $1`,
            [id]);
        
        const donations = donationRes.rows.map(e => ({id: e.donation_id, receive: e.receive}));

        return {id: family.id, camp: camp.rows[0], members: rows, donations};
    }


    /** Update family data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include: { camp_id, head }
     *
     * Returns { id, camp_id, head }
     *
     * Throws NotFoundError if not found.
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE families 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, camp_id, head`;
        const result = await db.query(querySql, [...values, id]);
        const family = result.rows[0];

        if (!family) throw new NotFoundError(`No family with ID ${id}`);

        return family;
    }


    /** Delete given family from database; returns undefined.
     *
     * Throws NotFoundError if family not found.
     **/
    static async remove(id) {
        const result = await db.query(
            `DELETE
           FROM families
           WHERE id = $1
           RETURNING id`, [id]);
        const family = result.rows[0];

        if (!family) throw new NotFoundError(`No family with ID ${id}`);
    }


    /* Get all donations for a family not already enrolled for. */
    static async getAllNewDonations(id) {
        const result = await db.query(
            `SELECT * FROM donations
            WHERE id NOT IN
            (SELECT donation_id FROM distributions WHERE family_id = $1)`, [id]);
        
        const donations = result.rows;
        
        return donations;
    }
}


module.exports = Family;
