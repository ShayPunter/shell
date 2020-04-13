import React from "react";

import { Spinner } from "ractf";
import colours from "../../Colours.scss";

import usePlotlyReady from "./usePlotlyReady";
import useWindowSize from "./useWindowSize";
import "./Charts.scss";


export default ({ data }) => {
    const plReady = usePlotlyReady();
    const winSize = useWindowSize();

    if (!plReady) return <div className={"graph-loading"}>
        <Spinner />
    </div>;

    let width;
    if (winSize.innerWidth <= 800)
        width = winSize.innerWidth - 32;
    else if (winSize.innerWidth <= 1200)
        width = winSize.innerWidth - 416;
    else
        width = winSize.innerWidth - 544;
    width = Math.min(1004, width);

    data = data.map(i => ({mode: "lines+markers", ...i, type: "scatter"}));

    const Plot = window.Plot;
    return <Plot
        data={data}
        layout={{
            width: width, height: 300,
            margin: { l: 50, r: 50, t: 50, pad: 0 },
            hovermode: "closest",
            legend: { orientation: "h", font: { color: colours.bg_l4 } },
            plot_bgcolor: colours.bg_d0,
            plot_fgcolor: colours.fg,
            paper_bgcolor: colours.bg_d0,
            xaxis: {
                gridcolor: colours.bg_l2,
                linecolor: colours.bg_l3,
                tickfont: { color: colours.bg_l4 },
                showspikes: true
            },
            yaxis: {
                gridcolor: colours.bg_l2,
                linecolor: colours.bg_l3,
                tickfont: { color: colours.bg_l4 },
                showspikes: true
            },
        }}
    />;
};
