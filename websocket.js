var socket = require('socket.io')
let mqtt = require('mqtt')

module.exports = function(server, con) {
    let client = mqtt.connect(process.env.MQTT_BROKER, {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD
    })

    var io = socket(server),
        topic = [
            //Subscribe topic mqtt
            'anggawgn/temperature',
            'anggawgn/humidity',
            'anggawgn/light',
            'anggawgn/water',
            'anggawgn/ph',
            'anggawgn/ppm'
        ],
        //Global current data sensor value
        current_temp = "",
        current_hum = "",
        current_light = "",
        current_water = "",
        current_ph = "",
        current_ppm = ""

    client.on('connect', function() {
        console.log(' Connected to Broker!!!')

        //Start sync aktuator database and microcontroller status
        var query = "SELECT * FROM aktuator"
        con.query(query, function(err, results) {
            if (err) throw err
            if (results.length) {
                var pump_status = "auto",
                    growlight_status = "auto"
                results.forEach(function(item, index) {
                    if (item['jenis'] == 'pump_auto') {
                        pump_status = item['status']
                    } else if (item['jenis'] == 'pump_manual' && pump_status == 'manual') {
                        client.publish("anggawgn/pump", item['status'])
                    } else if (item['jenis'] == 'growlight_auto') {
                        growlight_status = item['status']
                    } else if (item['jenis'] == 'growlight_munual' && growlight_status == 'manual') {
                        client.publish("anggawgn/growlight", item['status'])
                    }
                })
            }

            topic.forEach(function(value, index) {
                client.subscribe(value, function(err) {
                    console.log('Subscribe topic : ' + value)
                })
            })
        })
    })

    client.on('message', function(topic, message) {
        //Get date and time server
        var date = new Date(),
            hour = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            day = date.getDate(),
            month = parseInt(date.getMonth()) + 1,
            year = date.getFullYear(),
            dbDateTime = year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds

        if (topic == 'anggawgn/temperature') {
            current_temp = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_temperature` (`waktu`,`data`) VALUE ("
                sql += "'" + dbDateTime + "', "
                sql += "'" + current_temp + "');"
                con.query(sql, function(err, result) {
                    if (err) throw err
                })
            }
            io.sockets.emit('hidro_temp_msg', current_temp)

        } else if (topic == 'anggawgn/humidity') {
            current_hum = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_humidity` (`waktu`,`data`) VALUE ("
                sql += "'" + dbDateTime + "',"
                sql += "'" + current_hum + "');"
                con.query(sql, function(err, result) {
                    if (err) throw err
                })
            }
            io.sockets.emit('hidro_hum_msg', current_hum)

        } else if (topic == 'anggawgn/light') {
            current_light = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_light` (`waktu`,`data`) VALUE ("
                sql += "'" + dbDateTime + "',"
                sql += "'" + current_light + "');"
                con.query(sql, function(err, result) {
                    if (err) throw err
                })
            }
            io.sockets.emit('hidro_light_msg', current_light)

        } else if (topic == 'anggawgn/water') {
            current_water = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_water` (`waktu`,`data`) VALUE ("
                sql += "'" + dbDateTime + "',"
                sql += "'" + current_water + "');"
                con.query(sql, function(err, result) {
                    if (err) throw err
                })
            }
            io.sockets.emit('hidro_water_msg', current_water)

        } else if (topic == 'anggawgn/ph') {
            current_ph = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_ph` (`waktu`,`data`) VALUE ("
                sql += "'" + dbDateTime + "',"
                sql += "'" + current_ph + "');"
                con.query(sql, function(err, result) {
                    if (err) throw err
                })
            }
            io.sockets.emit('hidro_ph_msg', current_ph)

        } else if (topic == 'anggawgn/ppm') {
            current_ppm = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_ppm` (`waktu`,`data`) VALUE ("
                sql += "'" + dbDateTime + "',"
                sql += "'" + current_ppm + "');"
                con.query(sql, function(err, result) {
                    if (err) throw err
                })
            }
            io.sockets.emit('hidro_ppm_msg', current_ppm)
        }
    })

    io.on('connection', function(socket) {
        //Start pump automation status (auto/manual) socket event
        socket.on('pump_auto', function() {
            var status_type = 'pump_mode',
                check_query = "SELECT * FROM `aktuator` WHERE jenis = '" + status_type + "';",
                query = "UPDATE `aktuator` SET "
            query += "`status` = '" + 'auto' + "'"
            query += " WHERE `jenis` = '" + status_type + "';"
            con.query(check_query, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
            })
            io.sockets.emit('pump_auto')
        })

        socket.on('pump_manual', function() {
            var status_type = 'pump_mode',
                check_query = "SELECT * FROM `aktuator` WHERE jenis = '" + status_type + "';",
                query = "UPDATE `aktuator` SET "
            query += "`status` = '" + 'manual' + "'"
            query += " WHERE `jenis` = '" + status_type + "';"
            con.query(check_query, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
            })
            io.sockets.emit('pump_manual')
            client.publish("anggawgn/pump", 'off')
        })

        //Start pump manual (on/off) socket event
        socket.on('pump_on', function() {
            var status_type = 'pump_manual',
                check_query = "SELECT * FROM `aktuator` WHERE jenis = '" + status_type + "';",
                query = "UPDATE `aktuator` SET "
            query += "`status` = '" + 'on' + "'"
            query += " WHERE `jenis` = '" + status_type + "';"
            con.query(check_query, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
            })
            io.sockets.emit('pump_on')
            client.publish("anggawgn/pump", 'on')
        })

        socket.on('pump_off', function() {
            var status_type = 'pump_manual',
                check_query = "SELECT * FROM `aktuator` WHERE jenis = '" + status_type + "';",
                query = "UPDATE `aktuator` SET "
            query += "`status` = '" + 'off' + "'"
            query += " WHERE `jenis` = '" + status_type + "';"
            con.query(check_query, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
            })
            io.sockets.emit('pump_off')
            client.publish("anggawgn/pump", 'off')
        })

        //Start periode pump
        socket.on('pump_periode2', function() {
            var periode_status = 'periode_pump',
                check_periode = "SELECT * FROM `periode` WHERE jenis = '" + periode_status + "';",
                query = "UPDATE `periode` SET "
            query += "`status` = '" + '2' + "'"
            query += " WHERE `jenis` = '" + periode_status + "';"
            con.query(check_periode, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
                io.sockets.emit('pump_periode2')
            })
        })

        socket.on('pump_periode1', function() {
            var periode_status = 'periode_pump',
                check_periode = "SELECT * FROM `periode` WHERE jenis = '" + periode_status + "';",
                query = "UPDATE `periode` SET "
            query += "`status` = '" + '1' + "'"
            query += " WHERE `jenis` = '" + periode_status + "';"
            con.query(check_periode, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
                io.sockets.emit('pump_periode1')
            })
        })

        //Start growlight automation (auto/manual) socket event
        socket.on('growlight_auto', function() {
            var status_type = 'growlight_mode',
                check_query = "SELECT * FROM `aktuator` WHERE jenis = '" + status_type + "';",
                query = "UPDATE `aktuator` SET "
            query += "`status` = '" + 'auto' + "'"
            query += " WHERE `jenis` = '" + status_type + "';"
            con.query(check_query, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
            })
            io.sockets.emit('growlight_auto')
        })

        socket.on('growlight_manual', function() {
            var status_type = 'growlight_mode',
                check_query = "SELECT * FROM `aktuator` WHERE jenis = '" + status_type + "';",
                query = "UPDATE `aktuator` SET "
            query += "`status` = '" + 'manual' + "'"
            query += " WHERE `jenis` = '" + status_type + "';"
            con.query(check_query, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
            })
            io.sockets.emit('growlight_manual')
            client.publish("anggawgn/growlight", 'off')
        })

        //Start growlight manual (on/off) socket event
        socket.on('growlight_on', function() {
            var status_type = 'growlight_manual',
                check_query = "SELECT * FROM `aktuator` WHERE jenis = '" + status_type + "';",
                query = "UPDATE `aktuator` SET "
            query += "`status` = '" + 'on' + "'"
            query += " WHERE `jenis` = '" + status_type + "';"
            con.query(check_query, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
            })
            io.sockets.emit('growlight_on')
            client.publish("anggawgn/growlight", 'on')
        })

        socket.on('growlight_off', function() {
            var status_type = 'growlight_manual',
                check_query = "SELECT * FROM `aktuator` WHERE jenis = '" + status_type + "';",
                query = "UPDATE `aktuator` SET "
            query += "`status` = '" + 'off' + "'"
            query += " WHERE `jenis` = '" + status_type + "';"
            con.query(check_query, function(err, result) {
                if (err) throw err
                if (result.length) {
                    con.query(query)
                }
            }) 
            io.sockets.emit('growlight_off')
            client.publish("anggawgn/growlight", 'off')
        })

        socket.on('jam_pagi_pump_msg', function(msg) {
            client.publish("anggawgn/jam-pagi-pump", msg)
            console.log(msg)
        })

        socket.on('menit_pagi_pump_msg', function(msg) {
            client.publish("anggawgn/menit-pagi-pump", msg)
            console.log(msg)
        })

        socket.on('jam_sore_pump_msg', function(msg) {
            client.publish("anggawgn/jam-sore-pump", msg)
            console.log(msg)
        })

        socket.on('menit_sore_pump_msg', function(msg) {
            client.publish("anggawgn/menit-sore-pump", msg)
            console.log(msg)
        })

        socket.on('jam_pagi_growlight_msg', function(msg) {
            client.publish("anggawgn/jam-pagi-growlight", msg)
            console.log(msg)
        })

        socket.on('menit_pagi_growlight_msg', function(msg) {
            client.publish("anggawgn/menit-pagi-growlight", msg)
            console.log(msg)
        })

        socket.on('jam_sore_growlight_msg', function(msg) {
            client.publish("anggawgn/jam-sore-growlight", msg)
            console.log(msg)
        })

        socket.on('menit_sore_growlight_msg', function(msg) {
            client.publish("anggawgn/menit-sore-growlight", msg)
            console.log(msg)
        })

        socket.on('batas_max_ph', function(msg) {
            client.publish("anggawgn/max-ph", msg)
            console.log(msg)
        })

        socket.on('batas_min_ph', function(msg) {
            client.publish("anggawgn/min-ph", msg)
            console.log(msg)
        })

        socket.on('batas_max_lux', function(msg) {
            client.publish("anggawgn/max-light", msg)
            console.log(msg)
        })

        socket.on('batas_min_lux', function(msg) {
            client.publish("anggawgn/min-light", msg)
            console.log(msg)
        })
    })

    setInterval(function() {
        //Get date and time current server
        var date = new Date(),
            hour = date.getHours() < 10 ? '0' + String(date.getHours()) : date.getHours(),
            minutes = date.getMinutes() < 10 ? '0' + String(date.getMinutes()) : date.getMinutes(),
            seconds = date.getSeconds() < 10 ? '0' + String(date.getSeconds()) : date.getSeconds(),
            time = hour + ':' + minutes + ':' + seconds,

            //Start pump and growlight automation process
            query = "SELECT status FROM aktuator WHERE jenis = 'pump_mode';"
        query += "SELECT status FROM aktuator WHERE jenis = 'growlight_mode';"
        query += "SELECT status FROM periode WHERE jenis = 'periode_pump';"
        query += "SELECT jadwal_pagi FROM jadwal_aktuator WHERE jenis = 'pump';"
        query += "SELECT jadwal_sore FROM jadwal_aktuator WHERE jenis = 'pump';"
        query += "SELECT jadwal_pagi FROM jadwal_aktuator WHERE jenis = 'growlight';"
        query += "SELECT jadwal_sore FROM jadwal_aktuator WHERE jenis = 'growlight';"
        query += "SELECT jadwal_pagi1 FROM jadwal_aktuator_dua WHERE jenis = 'pump';"
        query += "SELECT jadwal_pagi2 FROM jadwal_aktuator_dua WHERE jenis = 'pump';"
        query += "SELECT jadwal_sore1 FROM jadwal_aktuator_dua WHERE jenis = 'pump';"
        query += "SELECT jadwal_sore2 FROM jadwal_aktuator_dua WHERE jenis = 'pump';"

        con.query(query, function(err, result) {
            if (err) throw err
            if(result.length) {
                client.publish("anggawgn/times", time)
                client.publish("anggawgn/pump-mode", result[0][0]['status'])
                client.publish("anggawgn/growlight-mode", result[1][0]['status'])

                //Start pump scheduling
                if (result[0][0]['status'] === 'auto') {
                    if (result[2][0]['status'] == '2') {
                        if (result[7][0]['jadwal_pagi1'] == time) {
                            client.publish("anggawgn/pump", 'on')
                            console.log('Periode Dua Jalan')
                            console.log('Pump Pagi ON')
                        } else if (result[8][0]['jadwal_pagi2'] == time) {
                            client.publish("anggawgn/pump", 'off')
                            console.log('Periode Dua Jalan')
                            console.log('Pump Pagi OFF')
                        } else if (result[9][0]['jadwal_sore1'] == time) {
                            client.publish("anggawgn/pump", 'on')
                            console.log('Periode Dua Jalan')
                            console.log('Pump Sore ON')
                        } else if (result[10][0]['jadwal_sore2'] == time) {
                            client.publish("anggawgn/pump", 'off')
                            console.log('Periode Dua Jalan')
                            console.log('Pump Sore OFF')
                        }

                    } else if (result[2][0]['status'] == '1') {
                        if (result[3][0]['jadwal_pagi'] == time) {
                            client.publish("anggawgn/pump", 'on')
                            console.log('Periode Satu Jalan')
                            console.log('Pump ON')
                        } else if (result[4][0]['jadwal_sore'] == time) {
                            client.publish("anggawgn/pump", 'off')
                            console.log('Periode Satu Jalan')
                            console.log('Pump OFF')
                        }
                    }
                }

                //Start growlight scheduling
                if (result[1][0]['status'] === 'auto') {
                    if (result[5][0]['jadwal_pagi'] == time) {
                        client.publish("anggawgn/growlight", 'off')
                    } else if (result[6][0]['jadwal_sore'] == time) {
                        client.publish("anggawgn/growlight", 'on')
                    }
                }
            }
        })
    }, 1000)
}