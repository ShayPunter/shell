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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import {
    Form, FormError, Page, HR, Input, Button, Row,
    SubtleText, Link, FormGroup, H2
} from "@ractf/ui-kit";
import { joinTeam, createTeam, reloadAll } from "@ractf/api";
import { Wrap } from "./Parts";
import http from "@ractf/http";
import { useConfig } from "@ractf/util";


export const JoinTeam = () => {
    const { t } = useTranslation();

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [locked, setLocked] = useState(false);
    const team = useSelector(state => state.team);
    const hasTeams = useConfig("enable_teams");

    if (!hasTeams)
        return <Redirect to={"/"} />;

    if (team !== null)
        return <Redirect to={"/campaign"} />;

    const doJoinTeam = ({ name, password }) => {
        if (!name.length)
            return setMessage(t("team_wiz.name_missing"));

        setLocked(true);
        joinTeam(name, password).then(resp => {
            setSuccess(true);
        }).catch(e => {
            setMessage(http.getError(e));
            setLocked(false);
        });
    };

    return <Page vCentre>
        <Wrap>{success ?
            <>
                <H2>{t("team_wiz.joined")}</H2>
                <HR />
                <div>{t("team_wiz.next")}</div>

                <Row>
                    <Button large to={"/campaign"}>{t("challenge_plural")}</Button>
                    <Button large lesser to={"/settings"}>{t("setting_plural")}</Button>
                </Row>
            </> : <>
                <H2>{t("join_a_team")}</H2>
                <SubtleText>
                    {t("team_wiz.did_you_want_to")}
                    <Link to={"/team/new"}>{t("team_wiz.create_a_team")}</Link>
                    {t("team_wiz.instead")}
                </SubtleText>

                <Form locked={locked} handle={doJoinTeam}>
                    <FormGroup>
                        <Input autofill={"off"} name={"name"} placeholder={t("team_name")} />
                        <Input autofill={"off"} name={"password"} placeholder={t("team_secret")} password />
                    </FormGroup>

                    {message && <FormError>{message}</FormError>}

                    <Row right>
                        <Button large submit>{t("team_wiz.join")}</Button>
                    </Row>
                </Form>
            </>}

        </Wrap>
    </Page>;
};


export const CreateTeam = () => {
    const { t } = useTranslation();

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [locked, setLocked] = useState(false);
    const team = useSelector(state => state.team);

    if (team !== null)
        return <Redirect to={"/campaign"} />;

    const doCreateTeam = ({ name, password }) => {
        if (!name.length)
            return setMessage(t("team_wiz.name_missing"));
        if (password.length < 8)
            return setMessage(t("team_wiz.pass_short"));

        setLocked(true);
        createTeam(name, password).then(resp => {
            reloadAll();
            setSuccess(true);
        }).catch(e => {
            setMessage(http.getError(e));
            setLocked(false);
        });
    };

    return <Page vCentre>
        <Wrap>{success ?
            <>
                <H2>{t("team_wiz.created")}</H2>
                <HR />
                <div>{t("team_wiz.next")}</div>

                <Row>
                    <Button large to={"/campaign"}>{t("challenge_plural")}</Button>
                    <Button large lesser to={"/settings"}>{t("setting_plural")}</Button>
                </Row>
            </> : <>
                <H2>{t("create_a_team")}</H2>
                <SubtleText>
                    {t("team_wiz.did_you_want_to")}
                    <Link to={"/team/join"}>{t("team_wiz.join_a_team")}</Link>
                    {t("team_wiz.instead")}
                </SubtleText>

                <Form locked={locked} handle={doCreateTeam}>
                    <FormGroup>
                        <Input autofill={"off"} name={"name"} limit={36} placeholder={t("team_name")} />
                        <Input autofill={"off"} name={"password"} placeholder={t("team_secret")} password />
                        <div style={{opacity: .5}}>{t("team_secret_warn")}</div>
                    </FormGroup>

                    {message && <FormError>{message}</FormError>}

                    <Row right>
                        <Button large submit>{t("team_wiz.create")}</Button>
                    </Row>
                </Form>
            </>}
        </Wrap>
    </Page>;
};
