// Copyright (C) 2020 Really Awesome Technology Ltd
//
// This file is part of RACTF.
//
// RACTF is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// RACTF is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with RACTF.  If not, see <https://www.gnu.org/licenses/>.

import React from "react";

import {
    PageHead, Row, Column, Card, Large, HR, Bar, Pie, Spinner
} from "@ractf/ui-kit";
import colours from "@ractf/ui-kit/Colours.scss";

import style from "./Statistics.module.scss";
import { useApi } from "controllers/UseAPI";
import { useCategories } from "@ractf/util/hooks";


const minMaxFunction = (data, mapper) => {
    let minMatch = [Infinity, null];
    let maxMatch = [-Infinity, null];

    for (const i of data) {
        const value = mapper(i);
        if (value > maxMatch[0]) {
            maxMatch = [value, i];
        }
        if (value < minMatch[0]) {
            minMatch = [value, i];
        }
    }
    return [minMatch[1], maxMatch[1]];
};


const Statistics = () => {
    const [stats] = useApi("/stats/full");
    const categories = useCategories();
    const challenges = categories.flatMap(i => i.challenges);

    if (!stats) return <>
        <PageHead title={"Statistics"} />
        <Spinner />
    </>;

    const add = (x, y) => x + y;

    const [minChallenge, maxChallenge] = minMaxFunction(challenges, i => i.solve_count);
    const maxPoints = challenges.map(i => i.score).reduce(add, 0);
    const totalCorrect = Object.keys(stats.challenges).map(i => stats.challenges[i].correct).reduce(add, 0);
    const totalIncorrect = Object.keys(stats.challenges).map(i => stats.challenges[i].incorrect).reduce(add, 0);
    const challengesPerCategory = Object.fromEntries(categories.map(i => [i.name, i.challenges.length]));
    const solvesPerCategory = Object.fromEntries(categories.map(i => [
        i.name, i.challenges.map(j => j.solve_count).reduce(add, 0)
    ]));
    const accuracyPerCategory = Object.fromEntries(categories.map(i => [
        i.name, (i.challenges.map(
            j => (stats.challenges[j.id] || {}).correct / (stats.challenges[j.id] || {}).incorrect
        ).filter(i => !isNaN(i)).reduce(add, 1) / i.challenges.length) * 100
    ]));

    return <>
        <PageHead title={"Statistics"} />
        <Row>
            <Column lgWidth={6} mdWidth={12}>
                <Card header={"Quick breakdown"}>
                    <Large><b>{stats.users.all}</b> registered users (
                        <b>{stats.users.all - stats.users.confirmed}</b> pending confirmation
                    )</Large>
                    <Large><b>{stats.teams}</b> registered teams</Large>
                    <Large><b>{stats.ips}</b> unique IPs</Large>
                    <HR />
                    <Large><b>{maxPoints}</b> total possible points</Large>
                    <Large><b>{stats.total_points}</b> total points scored</Large>
                    {maxChallenge && (
                        <Large><b>{maxChallenge.name}</b> has the most solves, at {maxChallenge.solve_count}</Large>
                    )}
                    {minChallenge && (
                        <Large><b>{minChallenge.name}</b> has the fewest solves, at {minChallenge.solve_count}</Large>
                    )}
                </Card>
            </Column>
            <Column lgWidth={6} mdWidth={12}>
                <Card header={"Solve count per challenge"}>
                    <Bar className={style.smallChart} yLabel={"Solves"} data={Object.fromEntries(
                        challenges.map(
                            challenge => [challenge.name, challenge.solve_count]
                        ).sort((x, y) => y[1] - x[1])
                    )} />
                </Card>
            </Column>
            <Column lgWidth={12}>
                <Card header={"Score distribution"}>
                    <Bar className={style.chart} yLabel={"Solves"} data={stats.team_point_distribution} />
                </Card>
            </Column>
            <Column lgWidth={12}>
                <Card header={"Solve percentage per challenge"}>
                    <Bar className={style.chart} yLabel={"Percentage of teams"} yMax={100}
                        data={Object.fromEntries(
                            challenges.map(
                                challenge => [challenge.name, 100 * (challenge.solve_count / stats.teams)]
                            ).sort((x, y) => y[1] - x[1])
                        )} percent />
                </Card>
            </Column>
            <Column lgWidth={6} mdWidth={12}>
                <Card header={"Solve accuracy"}>
                    <Pie className={style.chart}
                        data={[
                            totalCorrect / (totalCorrect + totalIncorrect) * 100,
                            totalIncorrect / (totalCorrect + totalIncorrect) * 100
                        ]}
                        labels={["Correct", "Incorrect"]}
                        colors={[colours.green, colours.red]} percent />
                </Card>
            </Column>
            <Column lgWidth={6} mdWidth={12}>
                <Card header={"Accuracy per category"}>
                    <Pie className={style.chart} data={Object.values(accuracyPerCategory)}
                        labels={Object.keys(accuracyPerCategory)} percent />
                </Card>
            </Column>
            <Column lgWidth={6} mdWidth={12}>
                <Card header={"Challenges per category"}>
                    <Pie className={style.chart} data={Object.values(challengesPerCategory)}
                        labels={Object.keys(challengesPerCategory)} />
                </Card>
            </Column>
            <Column lgWidth={6} mdWidth={12}>
                <Card header={"Solves per category"}>
                    <Pie className={style.chart} data={Object.values(solvesPerCategory)}
                        labels={Object.keys(solvesPerCategory)} />
                </Card>
            </Column>
        </Row>
    </>;
};
export default Statistics;
