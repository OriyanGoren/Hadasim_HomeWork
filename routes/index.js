const express = require('express');
const router = express.Router();
let contact = require("../Contact/contactIndex.js");

/** this route is used to POST - to add a new patient to the database
 * @param req
 * @param res */
router.post('/addPatient', contact.addPatient);

/** this route is used to POST - to add a new vaccination to the database
 * @param req
 * @param res */
router.post('/addVaccination', contact.addVaccination);

/** this route is used to POST - to add a new dates to the database
 * @param req
 * @param res */
router.post('/addDates', contact.addDates);

/** this route is used to GET - to get a new patient to the database
 * @param req
 * @param res */
router.get('/getPatient', contact.getPatient);

/** this route is used to GET - to get a new vaccination to the database
 * @param req
 * @param res */
router.get('/getVaccination', contact.getVaccination);

/** this route is used to GET - to get a new dates to the database
 * @param req
 * @param res */
router.get('/getDates', contact.getDates);

/**
 * this route is used to GET - to get all patient details from the database
 * @param req
 * @param res */
router.get('/getAllPatientDetails', contact.getAllPatientDetails);

/** this route is used to GET - to get all active patients in the last month from the database
 * Returns the number of active patients on each day of the last month.
 * For example if today is the date: 10/05/2023 then it will check what 10/04/2023 is up to today (one month back from today..).
 * @param req
 * @param res */
router.get('/getActivePatientsLastMonth', contact.getActivePatientsLastMonth);

/** this route is used to GET - to get how many Copa members are not vaccinated at all from the database
 * @param req
 * @param res */
router.get('/getCopaMembersNotVaccinated', contact.getCopaMembersNotVaccinated);

module.exports = router;