import React from 'react';
import { useState, useEffect } from "react";
import { db } from '../../firebase-config.js';
import { doc, getDoc } from 'firebase/firestore';
import { Scatter } from "react-chartjs-2";
import Chart from 'chart.js/auto';
import 'chartjs-subtitle';

export default function Scatterplot(props) {
    const [data, setData] = useState({
        val: [],
        label: [],
        x_enums: [],
        y_enums: [],
        x_enums1: [],
        y_enums1: [],
        title: "",
        xAxis: "",
        yAxis: "",
    });

    const [id, setId] = useState(0);

    useEffect(() => {

        getDoc(doc(db, "1A Data", props.datatype)).then(docSnap => {
            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());

                let data = {
                    val: [],
                    label: [],
                    color: [],
                    x_enums: [],
                    y_enums: [],
                    x_enums1: [],
                    y_enums1: [],
                    title: "",
                    xmax: "",
                    xmin: "",
                    ymin: "",
                    ymax: "",
                    n: "",
                    allow: false,
                };

                for (let i = 0; i < (docSnap.data().x.values.length); i++) {
                    data.val.push({
                        x: parseFloat(docSnap.data().x.values[i].value.toFixed(2)),
                        y: parseFloat(docSnap.data().y.values[i].value.toFixed(2)),
                    });
                    data.label.push(docSnap.data().x.values[i].index);
                    data.color.push(docSnap.data().x.values[i].color);
                }

                if (docSnap.data().xLimit.enums !== null) {
                    data.allow = true;
                    for (
                        var i = 0;
                        i < (docSnap.data().xLimit.enums.length);
                        i++
                    ) {
                        data.x_enums.push(docSnap.data().xLimit.enums[i].label);
                        data.x_enums1.push(docSnap.data().xLimit.enums[i].label);
                        data.x_enums.push("");
                    }
                }

                if (docSnap.data().yLimit.enums !== null) {
                    data.allow = true;
                    for (
                        var i = 0;
                        i < (docSnap.data().yLimit.enums.length);
                        i++
                    ) {
                        data.y_enums.push(docSnap.data().yLimit.enums[i].label);
                        data.y_enums1.push(docSnap.data().yLimit.enums[i].label);
                        data.y_enums.push("");
                    }
                }

                data.title = docSnap.data().title;
                data.xAxis = docSnap.data().x.label;
                data.yAxis = docSnap.data().y.label;
                data.xmin = docSnap.data().xLimit.min;
                data.xmax = docSnap.data().xLimit.max;
                data.ymin = docSnap.data().yLimit.min;
                data.ymax = docSnap.data().yLimit.max;
                data.n = docSnap.data().n;
                setId(id + 1);
                setData(data);

            } else {
                console.log("No such document!");
            }
        })
    }, []);

    function dataset_chartjs(data) {
        var datasets = [];

        if (data.label[0] !== null) {
            for (var i = 0; i < data.val.length; i++) {
                var add_data = {
                    label: data.label[i],
                    data: [data.val[i]],
                    backgroundColor: data.color[i],
                    borderColor: data.color[i],
                    hoverBorderWidth: 2,
                    pointRadius: 5,
                };
                datasets.push(add_data);
            }
        } else {
            datasets.push({
                label: "Student",
                data: data.val,
                backgroundColor: "#7582ca",
                hoverBorderColor: "#ffffff",
            });
        }
        return datasets;
    }

    return (
        <div>
            <div className='chart'>
                <Scatter
                    data={{
                        labels: data.x_enums,
                        enums: data.x_enums,
                        datasets: dataset_chartjs(data),
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        tooltips: {
                            enabled: true,
                            callbacks: {
                                label: function (tooltipItem) {
                                    var label = data.label[tooltipItem.datasetIndex];
                                    if (label !== null) {
                                        return (
                                            label +
                                            ": (" +
                                            tooltipItem.xLabel +
                                            ", " +
                                            tooltipItem.yLabel +
                                            ")"
                                        );
                                    } else {
                                        return (
                                            ": (" +
                                            tooltipItem.xLabel +
                                            ", " +
                                            tooltipItem.yLabel +
                                            ")"
                                        );
                                    }
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: "right",
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 8,
                                    padding: 8,
                                    fontSize: 12,
                                    fontColor: "#a0a0a0",
                                },
                            },
                            title: {
                                display: true,
                                text: data.title,
                                fontSize: 15,
                                fontColor: "#ffffff",
                                padding: 14,
                            },
                            subtitle: {
                                display: true,
                                fontSize: 13,
                                text: 'number of respondents:' + data.n,
                            },
                            scales: {
                                xAxes: [
                                    {
                                        gridLines: {
                                            zeroLineColor: "#fff",
                                            color: "rgba(255, 255, 255, 0.1)",
                                            lineWidth: 1.5,
                                        },
                                        scaleLabel: {
                                            display: true,
                                            labelString: data.xAxis,
                                            fontSize: 15,
                                            fontColor: "#ffffff",
                                        },
                                        afterTickToLabelConversion: function (q) {
                                            if (data.allow) {
                                                for (var tick in q.ticks) {
                                                    if (q.ticks.length === 9) {
                                                        if (data.x_enums[tick] !== "") {
                                                            q.ticks[tick] = data.x_enums[tick];
                                                            q.ticks[tick] = q.ticks[tick].split(" ");
                                                        }
                                                    } else {
                                                        if (tick % 2 === 0) {
                                                            q.ticks[tick] = data.x_enums1[tick];
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        ticks: {
                                            fontColor: "#ffffff",
                                            maxTicksLimit: 9,
                                            maxRotation: 0,
                                            minRotation: 0,
                                            min: parseInt(data.xmin),
                                            max: parseInt(data.xmax),
                                        },
                                    },
                                ],
                                yAxes: [
                                    {
                                        gridLines: {
                                            zeroLineColor: "#fff",
                                            color: "rgba(255, 255, 255, 0.1)",
                                            lineWidth: 1.5,
                                        },
                                        scaleLabel: {
                                            display: true,
                                            labelString: data.yAxis,
                                            fontSize: 15,
                                            fontColor: "#ffffff",
                                        },
                                        afterTickToLabelConversion: function (q) {
                                            if (data.allow) {
                                                for (var tick in q.ticks) {
                                                    if (q.ticks.length === 9) {
                                                        if (data.y_enums[tick] !== "") {
                                                            q.ticks[tick] = data.y_enums[tick];
                                                        }
                                                    } else {
                                                        if (tick % 2 === 0) {
                                                            q.ticks[tick] = data.y_enums1[tick];
                                                        }
                                                    }
                                                }
                                            }
                                        },
    
                                        ticks: {
                                            fontColor: "#ffffff",
                                            maxTicksLimit: 9,
                                            min: parseInt(data.ymin),
                                            max: parseInt(data.ymax),
                                        },
                                    },
                                ],
                            },
                        }
                    }}
                    height={props.height ? props.height : "100%"}
                    width={props.width ? props.width : "100%"}
                />
            </div>
        </div>
    );
}