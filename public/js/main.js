var socket = io.connect(),
    hidro_temp_chart = $('#hidro_temp_chart'),
    hidro_temp_value = $('#hidro_temp_value'),
    hidro_hum_value = $('#hidro_hum_value'),
    hidro_light_chart = $('#hidro_light_chart'),
    hidro_light_value = $('#hidro_light_value'),
    hidro_water_chart = $('#hidro_water_chart'),
    hidro_water_value = $('#hidro_water_value'),
    hidro_ph_chart = $('#hidro_ph_chart'),
    hidro_ph_value = $('#hidro_ph_value'),
    hidro_ppm_chart = $('#hidro_ppm_chart'),
    hidro_ppm_value = $('#hidro_ppm_value'),
    hidro_pump_toggle = $('#hidro_pump_toggle'),
    hidro_pump_title = $('#hidro_pump_title'),
    hidro_pump_container = $('#hidro_pump_container'),
    hidro_switch_pump_toggle = $('#hidro_switch_pump_toggle'),
    hidro_switch_pump_title = $('#hidro_switch_pump_title'),
    hidro_switch_pump_container = $('#hidro_switch_pump_container'),
    hidro_periode_pump_container = $('#hidro_periode_pump_container'),
    hidro_switch_periode_toggle = $('#hidro_switch_periode_toggle'),
    hidro_switch_periode_title = $('#hidro_switch_periode_title'),
    hidro_periode_satu_container = $('#hidro_periode_satu'),
    hidro_periode_dua_container = $('#hidro_periode_dua'),
    hidro_growlight_toggle = $('#hidro_growlight_toggle'),
    hidro_growlight_title = $('#hidro_growlight_title'),
    hidro_growlight_container = $('#hidro_growlight_container'),
    hidro_switch_growlight_toggle = $('#hidro_switch_growlight_toggle'),
    hidro_switch_growlight_title = $('#hidro_switch_growlight_title'),
    hidro_switch_growlight_container = $('#hidro_switch_growlight_container')


function myTime() {
    var date = new Date(),
        hour = date.getHours() < 10 ? '0' + String(date.getHours()) : date.getHours(),
        minutes = date.getMinutes() < 10 ? '0' + String(date.getMinutes()) : date.getMinutes(),
        seconds = date.getSeconds() < 10 ? '0' + String(date.getSeconds()) : date.getSeconds(),
        time = hour + ":" + minutes + ":" + seconds

    return time
}

function removeData(chart) {
    chart.data.labels.shift()
    chart.data.datasets.forEach(function(dataset) {
        dataset.data.shift()
    })
    chart.update()
}

//Set Max and Min PH
function setBatasPH() {
    let hidro_max_ph = document.getElementById('hidro_max_ph').value,
        hidro_min_ph = document.getElementById('hidro_min_ph').value

    if (parseInt(hidro_max_ph) > '14') {
        alert("[ WARNING!!! ]\n MAX NILAI BATASAN PH 14")
        $('hidro_min_ph').val('')
        $('hidro_min_ph').val('')
    } else if (parseInt(hidro_min_ph) > parseInt(hidro_max_ph)) {
        alert("[ WARNING!!! ]\n TOLONG INPUT MIN PH TIDAK MELEBIHI INPUT MAXPH")
        $('hidro_min_ph').val('')
        $('hidro_min_ph').val('')
    } else if (hidro_max_ph == '') {
        alert("[ WARNING!!! ]\n DATA BATASAN MAX PH KOSONG")
    } else if (hidro_min_ph == '') {
        alert("[ WARNING!!! ]\n DATA BATASAN MIN PH KOSONG")
    } else {
        alert("[ SUCCESS ]\n NILAI BATASAH PH BERHASIL DIUBAH")
        socket.emit('batas_max_ph', hidro_max_ph)
        socket.emit('batas_min_ph', hidro_min_ph)
    }
}

function setBatasLUX() {
    let hidro_max_lux = document.getElementById('hidro_max_lux').value,
        hidro_min_lux = document.getElementById('hidro_min_lux').value

    if (parseInt(hidro_max_lux) > '100000') {
        alert("[ WARNING!!! ]\n MAX NILAI BATASAN LUX 100000")
        $('hidro_min_ph').val('')
        $('hidro_min_ph').val('')
    } else if (parseInt(hidro_min_lux) > parseInt(hidro_max_lux)) {
        alert("[ WARNING!!! ]\n TOLONG INPUT MIN PH TIDAK MELEBIHI INPUT MAX LUX")
        $('hidro_min_ph').val('')
        $('hidro_min_ph').val('')
    } else if (hidro_max_lux == '') {
        alert("[ WARNING!!! ]\n DATA BATASAN MAX LUX KOSONG")
    } else if (hidro_min_lux == '') {
        alert("[ WARNING!!! ]\n DATA BATASAN MIN LUX KOSONG")
    } else {
        alert("[ SUCCESS ]\n NILAI BATASAH LUX BERHASIL DIUBAH")
        socket.emit('batas_max_lux', hidro_max_lux)
        socket.emit('batas_min_lux', hidro_min_lux)
    }
}

function setPump() {
    let jam_pagi_pump = document.getElementById("jam_pagi_pump").value,
        menit_pagi_pump = document.getElementById("menit_pagi_pump").value,
        jam_sore_pump = document.getElementById("jam_sore_pump").value,
        menit_sore_pump = document.getElementById("menit_sore_pump").value

    socket.emit('jam_pagi_pump_msg', jam_pagi_pump)
    socket.emit('menit_pagi_pump_msg', menit_pagi_pump)
    socket.emit('jam_sore_pump_msg', jam_sore_pump)
    socket.emit('menit_sore_pump_msg', menit_sore_pump)
}

function setGrowlight() {
    let jam_pagi_growlight = document.getElementById("jam_pagi_growlight").value,
        menit_pagi_growlight = document.getElementById("menit_pagi_growlight").value,
        jam_sore_growlight = document.getElementById("jam_sore_growlight").value,
        menit_sore_growlight = document.getElementById("menit_sore_growlight").value

    socket.emit('jam_pagi_growlight_msg', jam_pagi_growlight)
    socket.emit('menit_pagi_growlight_msg', menit_pagi_growlight)
    socket.emit('jam_sore_growlight_msg', jam_sore_growlight)
    socket.emit('menit_sore_growlight_msg', menit_sore_growlight)
}

//Start pump toggle event emitter
hidro_pump_toggle.change(function() {
    //pump toggle automation (auto/manual)
    if (this.checked) {
        socket.emit('pump_auto')
    } else {
        socket.emit('pump_manual')
    }
})

hidro_switch_pump_toggle.change(function() {
    if (this.checked) {
        socket.emit('pump_on')
    } else {
        socket.emit('pump_off')
    }
})

//Start pump periode
hidro_switch_periode_toggle.change(function() {
    if (this.checked) {
        socket.emit('pump_periode2')
    } else {
        socket.emit('pump_periode1')
    }
})

//Start growlight toggle event emitter
hidro_growlight_toggle.change(function() {
    if (this.checked) {
        socket.emit('growlight_auto')
    } else {
        socket.emit('growlight_manual')
    }
})

hidro_switch_growlight_toggle.change(function() {
    if (this.checked) {
        socket.emit('growlight_on')
    } else {
        socket.emit('growlight_off')
    }
})

//Start temp and hum chart
if (typeof hidro_temp_chart[0] !== 'undefined') {
    var old_temp_value = [0, 0, 0, 0, 0],
        old_hum_value = [0, 0, 0, 0, 0],
        old_temp_labels = [0, 0, 0, 0, 0],
        temp_ctx = hidro_temp_chart[0].getContext('2d'),
        temp_chart = new Chart(temp_ctx, {
            type: 'line',
            data: {
                labels: old_temp_labels,
                datasets: [{
                    label: 'Suhu',
                    data: old_temp_value,
                    backgroundColor: 'rgba(242, 115, 140, 0.5)',
                    borderColor: 'rgb(220, 20, 60)',
                    borderWidth: 1
                }, {
                    label: 'Kelembapan',
                    data: old_hum_value,
                    backgroundColor: 'rgba(102, 217, 255, 0.5)',
                    borderColor: 'rgb(0, 191, 255)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2
        })

    let temp_msg

    socket.on('hidro_temp_msg', function(msg) {
        temp_msg = msg
        hidro_temp_value.text(parseInt(temp_msg))
    })

    socket.on('hidro_hum_msg', function(msg) {
        hidro_hum_value.text(parseInt(msg))
        var time = myTime()
        temp_chart.data.datasets[0].data.push(parseInt(temp_msg))
        temp_chart.data.datasets[1].data.push(parseInt(msg))
        temp_chart.data.labels.push(time)
        temp_chart.update()
        removeData(temp_chart)
    })
}

//Start light chart
if (typeof hidro_light_chart[0] !== 'undefined') {
    var old_light_value = [0, 0, 0, 0, 0],
        old_light_labels = [0, 0, 0, 0, 0],
        light_ctx = hidro_light_chart[0].getContext('2d'),
        light_chart = new Chart(light_ctx, {
            type: 'line',
            data: {
                labels: old_light_labels,
                datasets: [{
                    label: 'Intensitas Cahaya',
                    data: old_light_value,
                    backgroundColor: 'rgba(255, 255, 77, 0.5)',
                    borderColor: 'rgb(255, 242, 0)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2
        })

    socket.on('hidro_light_msg', function(msg) {
        hidro_light_value.text(parseInt(msg))
        var time = myTime()
        light_chart.data.datasets[0].data.push(parseInt(msg))
        light_chart.data.labels.push(time)
        light_chart.update()
        removeData(light_chart)
    })
}

//Start temperature water chart
if (typeof hidro_water_chart[0] !== 'undefined') {
    var old_water_value = [0, 0, 0, 0, 0],
        old_water_labels = [0, 0, 0, 0, 0],
        water_ctx = hidro_water_chart[0].getContext('2d'),
        water_chart = new Chart(water_ctx, {
            type: 'line',
            data: {
                labels: old_water_labels,
                datasets: [{
                    label: 'Suhu Air',
                    data: old_water_value,
                    backgroundColor: 'rgba(102, 179, 255, 0.5)',
                    borderColor: 'rgb(30, 144, 255)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2
        })

    socket.on('hidro_water_msg', function(msg) {
        hidro_water_value.text(msg)
        var time = myTime()
        water_chart.data.datasets[0].data.push(parseInt(msg))
        water_chart.data.labels.push(time)
        water_chart.update()
        removeData(water_chart)
    })
}

//Start pH Chart
if (typeof hidro_ph_chart[0] !== 'undefined') {
    var old_ph_value = [0, 0, 0, 0, 0],
        old_ph_labels = [0, 0, 0, 0, 0],
        ph_ctx = hidro_ph_chart[0].getContext('2d'),
        ph_chart = new Chart(ph_ctx, {
            type: 'line',
            data: {
                labels: old_ph_labels,
                datasets: [{
                    label: 'pH Air',
                    data: old_ph_value,
                    backgroundColor: 'rgba(102, 179, 255, 0.5)',
                    borderColor: 'rgb(30, 144, 255)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2
        })

    socket.on('hidro_ph_msg', function(msg) {
        hidro_ph_value.text(parseInt(msg))
        var time = myTime()
        ph_chart.data.datasets[0].data.push(parseInt(msg))
        ph_chart.data.labels.push(time)
        ph_chart.update()
        removeData(ph_chart)
    })
}

//Start ppm Chart
if (typeof hidro_ppm_chart[0] !== 'undefined') {
    var old_ppm_value = [0, 0, 0, 0, 0],
        old_ppm_labels = [0, 0, 0, 0, 0],
        ppm_ctx = hidro_ppm_chart[0].getContext('2d'),
        ppm_chart = new Chart(ppm_ctx, {
            type: 'line',
            data: {
                labels: old_ppm_labels,
                datasets: [{
                    label: 'PPM Air',
                    data: old_ppm_value,
                    backgroundColor: 'rgba(102, 179, 255, 0.5)',
                    borderColor: 'rgb(30, 144, 255)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2
        })

    socket.on('hidro_ppm_msg', function(msg) {
        hidro_ppm_value.text(msg)
        var time = myTime()
        ppm_chart.data.datasets[0].data.push(parseInt(msg))
        ppm_chart.data.labels.push(time)
        ppm_chart.update()
        removeData(ppm_chart)
    })
}

$(function() {
    //Start pump toggle event listener
    socket.on('pump_auto', function() {
        hidro_pump_toggle.prop('checked', true)
        hidro_pump_title.text('Auto')
        hidro_pump_container.show()
        hidro_switch_pump_container.hide()
        hidro_periode_pump_container.show()

    })

    socket.on('pump_manual', function() {
        hidro_pump_toggle.prop('checked', false)
        hidro_pump_title.text('Manual')
        hidro_pump_container.hide()
        hidro_switch_pump_container.show()
        hidro_periode_pump_container.hide()
    })

    socket.on('pump_on', function() {
        hidro_switch_pump_toggle.prop('checked', true)
        hidro_switch_pump_title.text('ON')
    })

    socket.on('pump_off', function() {
        hidro_switch_pump_toggle.prop('checked', false)
        hidro_switch_pump_title.text('OFF')
    })

    //Start periode toggle envent listener
    socket.on('pump_periode2', function() {
        hidro_switch_periode_toggle.prop('checked', true)
        hidro_switch_periode_title.text('2 Periode')
        hidro_periode_dua_container.show()
        hidro_periode_satu_container.hide()
    })

    socket.on('pump_periode1', function() {
        hidro_switch_periode_toggle.prop('checked', false)
        hidro_switch_periode_title.text('1 Periode')
        hidro_periode_dua_container.hide()
        hidro_periode_satu_container.show()
    })


    //Start growlight toggle event listener
    socket.on('growlight_auto', function() {
        hidro_growlight_toggle.prop('checked', true)
        hidro_growlight_title.text('Auto')
        hidro_growlight_container.show()
        hidro_switch_growlight_container.hide()
    })

    socket.on('growlight_manual', function() {
        hidro_growlight_toggle.prop('checked', false)
        hidro_growlight_title.text('Manual')
        hidro_growlight_container.hide()
        hidro_switch_growlight_container.show()
    })

    socket.on('growlight_on', function() {
        hidro_switch_growlight_toggle.prop('checked', true)
        hidro_switch_growlight_title.text('ON')
    })

    socket.on('growlight_off', function() {
        hidro_switch_growlight_toggle.prop('checked', false)
        hidro_switch_growlight_title.text('OFF')
    })

    socket.on('hidro_temp_msg', function(msg) {
        hidro_temp_value.text(msg)
    })

    socket.on('hidro_hum_msg', function(msg) {
        hidro_hum_value.text(msg)
    })

    socket.on('hidro_light_msg', function(msg) {
        hidro_light_value.text(msg)
    })

    socket.on('hidro_water_msg', function(msg) {
        hidro_water_value.text(msg)
    })

    socket.on('hidro_ph_msg', function(msg) {
        hidro_ph_value.text(msg)
    })

    socket.on('hidro_ppm_msg', function(msg) {
        hidro_ppm_value.text(msg)
    })

})