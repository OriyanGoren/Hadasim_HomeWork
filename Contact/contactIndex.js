var mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "coronadb"
});

module.exports = (function() {

    function addPatient(req, res) {
        con.connect(function(err) {
            if (err) throw err;
            var checkSql = 'SELECT ID FROM personal_details WHERE ID = ?';
            con.query(checkSql, [req.query.id], function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    // ID already exists, send a response indicating it cannot be added twice
                    res.send('ID already exists in the table. Cannot add it twice.');
                }
                else {
                    var sql = 'INSERT INTO personal_details ' +
                        'VALUES (' + req.query.id + ',' + "'" + req.query.first_name + "'" + ',' + "'" + req.query.last_name + "'" + ',' + "'" + req.query.city + "'" + ',' +
                        "'" + req.query.street + "'" + ',' + req.query.house_number + ',"' + req.query.date_birth + '",' + req.query.phone + ',' +
                        req.query.mobile_phone + ');';
                    con.query(sql, function (err, result) { if (err) throw err;});
                    res.send('Patient added successfully.');
                }
            });
        });
    }
    function addVaccination(req, res) {
        con.connect(function(err) {
            if (err) throw err;
            // Check if the patient exists in the patient table
            var checkSql = `SELECT * FROM personal_details WHERE id = ${req.query.id};`;
            con.query(checkSql, function (err, result) {
                if (err) throw err;
                if (result.length === 1) {
                    // Count the number of vaccinations for the patient
                    var countSql = `SELECT COUNT(*) AS num_vaccinations FROM vaccine_details WHERE id = ${req.query.id};`;
                    con.query(countSql, function (err, result) {
                        if (err) throw err;
                        var numVaccinations = result[0].num_vaccinations;
                        // Check if the patient has had < 4 vaccinations
                        if (numVaccinations < 4) {
                            var sql = `INSERT INTO vaccine_details (id, date_receiving_vaccine, manufacturer_vaccine) VALUES (${req.query.id}, '${req.query.date_receiving_vaccine}', '${req.query.manufacturer_vaccine}');`;
                            con.query(sql, function (err, result) {
                                if (err) throw err;
                                res.send("Vaccination added successfully.");
                            });
                        }
                        else res.send("Cannot add vaccination. Patient has already had " + numVaccinations + " vaccinations.");
                    });
                }
                else res.send("No vaccine can be added - Patient ID not found in personal_details table.");
            });
        });
    }
    function addDates(req, res) {
        con.connect(function(err) {
            if (err) throw err;
            var checkPersonalDetails = `SELECT * FROM personal_details WHERE id = ${req.query.id};`;
            var checkDatesSickRecovery = `SELECT * FROM dates_sick_recovery WHERE id = ${req.query.id};`;
            con.query(checkPersonalDetails, function (err, personalDetailsResult) {
                if (err) throw err;
                con.query(checkDatesSickRecovery, function (err, datesSickRecoveryResult) {
                    if (err) throw err;
                    if (personalDetailsResult.length === 0)
                        res.send('No days of infection from the virus can be added - Patient ID not found in personal_details table.');
                    else if (datesSickRecoveryResult.length === 0) {
                        var insertSql = `INSERT INTO dates_sick_recovery (id, positive_result_date, recovery_date) VALUES (${req.query.id}, '${req.query.positive_result_date}', '${req.query.recovery_date}');`;
                        con.query(insertSql, function (err, result) {
                            if (err) throw err;
                            res.send('Date added successfully.');
                        });
                    } else res.send('User already has a record in dates_sick_recovery.');
                });
            });
        });
    }
    function getPatient(req, res) {
        con.connect(function(err) {
            if (err) throw err;
            var sql = 'SELECT * FROM personal_details WHERE id = '+req.query.id+';';
            con.query(sql, function (err, result) {
                if (err) throw err;
                // format date
                result.forEach(function(line) { line.date_birth = new Date(line.date_birth).toLocaleDateString('en-CA');});
                res.send(result);
            });
        });
    }
    function getVaccination(req, res) {
        con.connect(function(err) {
            if (err) throw err;
            var sql = 'SELECT * FROM vaccine_details WHERE id = '+req.query.id+';';
            con.query(sql, function (err, result) {
                if (err) throw err;
                result.forEach(function(line) { line.date_receiving_vaccine = new Date(line.date_receiving_vaccine).toLocaleDateString('en-CA');});
                res.send(result);
            });
        });
    }
    function getDates(req, res) {
        con.connect(function(err) {
            if (err) throw err;
            var sql = 'SELECT * FROM dates_sick_recovery WHERE id = '+req.query.id+';';
            con.query(sql, function (err, result) {
                if (err) throw err;
                result.forEach(function(line) {
                    line.positive_result_date = new Date(line.positive_result_date).toLocaleDateString('en-CA');
                    line.recovery_date = new Date(line.recovery_date).toLocaleDateString('en-CA');});
                res.send(result);
            });
        });
    }
    function getAllPatientDetails(req, res) {
        const id = req.query.id;
        con.connect(function(err) {
            if (err) throw err;
            var sql = `SELECT pd.ID, pd.firstName, pd.lastName, pd.city, pd.street, pd.house_number, pd.date_birth, pd.phone, pd.mobile_phone, vd.date_receiving_vaccine, vd.manufacturer_vaccine, dsr.positive_result_date, dsr.recovery_date
            FROM personal_details AS pd LEFT JOIN (SELECT ID, 
            GROUP_CONCAT(date_receiving_vaccine) AS date_receiving_vaccine,
            GROUP_CONCAT(manufacturer_vaccine) AS manufacturer_vaccine
            FROM vaccine_details GROUP BY ID) AS vd ON pd.ID = vd.ID 
            JOIN dates_sick_recovery AS dsr ON pd.ID = dsr.ID WHERE pd.ID = ?;`;
            con.query(sql, [id], function (err, result) {
                if (err) throw err;
                result.forEach(function(line) {
                    line.date_birth = new Date(line.date_birth).toLocaleDateString('en-CA');
                    if (line.date_receiving_vaccine && line.manufacturer_vaccine) {
                        line.date_receiving_vaccine = line.date_receiving_vaccine.split(",");
                        line.manufacturer_vaccine = line.manufacturer_vaccine.split(",");
                    } else {
                        line.date_receiving_vaccine = [];
                        line.manufacturer_vaccine = [];
                    }
                    line.positive_result_date = new Date(line.positive_result_date).toLocaleDateString('en-CA');
                    line.recovery_date = new Date(line.recovery_date).toLocaleDateString('en-CA');
                });
                res.send(result);
            });
        });
    }
    function getActivePatientsLastMonth(req, res) {
        con.connect(function(err) {
            if (err) throw err;
            var sql = `SELECT DATE_FORMAT(positive_result_date, '%Y-%m-%d') AS date, COUNT(*) AS active_patients
            FROM dates_sick_recovery WHERE positive_result_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
            GROUP BY date ORDER BY date ASC;`;
            con.query(sql, function(err, result) {
                if (err) throw err;
                result.forEach(function(line) {
                    line.date = new Date(line.date).toISOString().split('T')[0];
                });
                res.send(result);
            });
        });
    }
    function getCopaMembersNotVaccinated(req, res) {
        con.connect(function(err) {
            if (err) throw err;
            var sql = `SELECT id FROM personal_details
                   WHERE id NOT IN (SELECT id FROM vaccine_details);`;
            con.query(sql, function (err, result) {
                if (err) throw err;
                var countSql = `SELECT COUNT(*) AS num_not_vaccinated FROM personal_details
                            WHERE id NOT IN (SELECT id FROM vaccine_details);`;
                con.query(countSql, function (err, countResult) {
                    if (err) throw err;
                    var numNotVaccinated = countResult[0].num_not_vaccinated;
                    var response = {
                        count: numNotVaccinated,
                        IDcards: result.map(member => member.id)
                    };
                    res.send(response);
                });
            });
        });
    }
    return {
        addPatient: addPatient,
        addVaccination: addVaccination,
        addDates: addDates,
        getPatient: getPatient,
        getVaccination: getVaccination,
        getDates: getDates,
        getAllPatientDetails: getAllPatientDetails,
        getActivePatientsLastMonth: getActivePatientsLastMonth,
        getCopaMembersNotVaccinated: getCopaMembersNotVaccinated
    };

})();
