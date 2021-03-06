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
import Moment from "react-moment";
import { useTranslation } from "react-i18next";

import { transparentize } from "polished";
import { BrokenShards } from "./ErrorPages";

import { useReactRouter } from "@ractf/util";
import {
    Spinner, FormError, Link, TabbedView, Tab, HR, Graph, Pie, Page, Row
} from "@ractf/ui-kit";
import { ENDPOINTS } from "@ractf/api";
import { useApi } from "ractf";

import admin from "static/img/admin.png";
import donor from "static/img/donor_large.png";
import beta from "static/img/beta.png";
import colours from "@ractf/ui-kit/Colours.scss";

import "./Profile.scss";
import { FaTwitter, FaDiscord, FaRedditAlien, FaUsers } from "react-icons/fa";
import { useCategories } from "@ractf/util/hooks";


const UserSpecial = ({ children, col, ico }) => (
    <div className={"userSpecial"} style={{ backgroundColor: transparentize(.7, col) }}>
        <div style={{ backgroundImage: "url(" + ico + ")" }} />
        {children}
    </div>
);

const UserSolve = ({ challenge_name, points }) => {
    const { t } = useTranslation();

    return (
        <div className={"userSolve"}>
            <div>{challenge_name}</div>
            <div>{t("point_count", { count: points })}</div>
        </div>
    );
};

const Profile = () => {
    const { match } = useReactRouter();
    const { t } = useTranslation();
    const user = match.params.user;
    const categories = useCategories();
    const [userData, error] = useApi(ENDPOINTS.USER + (user === "me" ? "self" : user));

    if (error) return <Page title={"Users"} centre>
        <FormError>{error}</FormError>
        <BrokenShards />
    </Page>;
    if (!userData) return <Page title={"Users"} centre><Row><Spinner /></Row></Page>;

    const categoryValues = {};
    const uData = userData.solves.filter(Boolean).sort((a, b) => (new Date(a.timestamp)) - (new Date(b.timestamp)));
    const scorePlotData = { x: [], y: [], name: "score", fill: "tozeroy" };
    // OPTIONAL: Use start time instead of first solve
    // scorePlotData.x.push(api.config.start_time);
    // scorePlotData.y.push(0);
    uData.forEach(solve => {
        let category;
        categories && categories.forEach(cat => {
            cat.challenges.forEach(chal => {
                if (chal.id === solve.challenge)
                    category = cat.name;
            });
        });
        if (category === null) return;
        if (!categoryValues[category]) categoryValues[category] = 0;
        categoryValues[category]++;

        const score = (scorePlotData.y[scorePlotData.y.length - 1] || 0) + solve.points;
        scorePlotData.x.push(new Date(solve.timestamp));
        scorePlotData.y.push(score);
    });

    return <Page title={userData.username}>
        <div className={"profileSplit"}>
            <div className={"userMeta"}>
                <div className={"userName"}>{userData.username}</div>
                <div>{t("point_count", { count: userData.leaderboard_points })}</div>
                <div className={"userJoined"}>Joined <Moment fromNow>{new Date(userData.date_joined)}</Moment></div>
                <div className={"userBio" + ((!userData.bio || userData.bio.length === 0) ? " noBio" : "")}>
                    {userData.bio || t("profile.no_bio")}
                </div>

                {userData.twitter && userData.twitter.length !== 0 &&
                    <a className={"userSocial"} target={"_blank"}
                        href={"https://twitter.com/" + encodeURIComponent(userData.twitter)}>
                        <FaTwitter /><span>@{userData.twitter}</span>
                    </a>}
                {userData.reddit && userData.reddit.length !== 0 &&
                    <a className={"userSocial"} target={"_blank"}
                        href={"https://reddit.com/u/" + encodeURIComponent(userData.reddit)}>
                        <FaRedditAlien /><span>/u/{userData.reddit}</span>
                    </a>}
                {userData.discord && userData.discord.length !== 0 &&
                    (userData.discordid && userData.discordid.length !== 0
                        ? <a target={"_blank"}
                            href={"https://discordapp.com/users/" + encodeURIComponent(userData.discordid)}
                            className={"userSocial"}>
                            <FaDiscord /><span>{userData.discord}</span>
                        </a>
                        : <span className={"userSocial"}>
                            <FaDiscord /><span>{userData.discord}</span>
                        </span>)}

                {userData.team && <Link to={"/team/" + (userData.team.id || userData.team)} className={"teamMemberico"}>
                    <FaUsers /> {userData.team_name}
                </Link>}
                {Object.keys(categoryValues).length !== 0 && <>
                    <div className={"profilePieWrap"}>
                        <div className={"ppwHead"}>Solve attempts</div>
                        <Pie data={[userData.solves.filter(Boolean).length, userData.incorrect_solves]}
                            labels={["Correct", "Incorrect"]}
                            colors={[colours.green, colours.red]} />
                    </div>
                </>}
            </div>
            <div className={"userSolves"}>
                {userData.is_beta &&
                    <UserSpecial col={"#66bb66"} ico={beta}>Beta Tester</UserSpecial>}
                {userData.is_donor &&
                    <UserSpecial col={"#bbbb33"} ico={donor}>Donor</UserSpecial>}
                {userData.is_staff &&
                    <UserSpecial col={"#bb6666"} ico={admin}>Admin</UserSpecial>}

                {(!userData.solves || userData.solves.filter(Boolean).length === 0) ? <div className={"noSolves"}>
                    {t("profile.no_solves", { name: userData.username })}
                </div> : <TabbedView>
                        <Tab label={"Solves"}>
                            {userData.solves && userData.solves.filter(Boolean).map((i, n) => (
                                <UserSolve key={i.timestamp} {...i} />
                            ))}
                        </Tab>
                        <Tab label={"Stats"}>
                            <div className={"ppwRow"}>
                                <div className={"profilePieWrap"}>
                                    <div className={"ppwHead"}>Solve attempts</div>
                                    <Pie data={[userData.solves.filter(Boolean).length, userData.incorrect_solves]}
                                        colors={[colours.green, colours.red]}
                                        labels={["Correct", "Incorrect"]} height={300} />
                                </div>
                                <div className={"profilePieWrap"}>
                                    <div className={"ppwHead"}>Category Breakdown</div>
                                    <Pie data={Object.values(categoryValues)}
                                        labels={Object.keys(categoryValues)} />
                                </div>
                            </div>
                            <HR />
                            <div>
                                <div className={"ppwHead"}>Score Over Time</div>
                                <Graph data={[scorePlotData]} />
                            </div>
                        </Tab>
                    </TabbedView>}
            </div>
        </div>
    </Page>;
};
export default Profile;
