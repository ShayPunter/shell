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
import { useTranslation } from "react-i18next";

import { BrokenShards } from "./ErrorPages";

import {
    Page, Table, FormError, Button, Row, H2
} from "@ractf/ui-kit";
import { ENDPOINTS } from "@ractf/api";
import { usePaginated } from "ractf";
import { useConfig } from "@ractf/util";
import { Redirect } from "react-router-dom";


export const TeamsList = () => {
    //const [{results, hasMore}, next, loading, error] = usePaginated(ENDPOINTS.TEAM);
    const [state, next] = usePaginated(ENDPOINTS.TEAM); 
    const hasTeams = useConfig("enable_teams");

    const { t } = useTranslation();

    if (!hasTeams)
        return <Redirect to={"/"} />;

    return <Page
        title={t("team_plural")} centre={state.error}>
        <div style={{ textAlign: "center" }}>
            <H2>{t("lists.all_teams")}</H2>
            <br />
        </div>
        {state.error ? <>
            <FormError>
                {t("lists.teams_error")}<br />{t("lists.try_reload")}
            </FormError>
            <BrokenShards />
        </> : <>
            <Table headings={[t("team"), t("members")]} data={
                state.data.map(x => [x.name, x.members, { link: "/team/" + x.id }])
            } />
            {state.hasMore && <Row>
                <Button disabled={state.loading} onClick={next}>Load More</Button>
            </Row>}
        </>}
    </Page>;
};


export const UsersList = () => {
    //const [{results, hasMore}, next, loading, error] = usePaginated(ENDPOINTS.USER);
    const [state, next] = usePaginated(ENDPOINTS.USER); 
    const { t } = useTranslation();

    return <Page
        title={t("user_plural")} centre={!!state.error}>
        <div style={{ textAlign: "center" }}>
            <H2>{t("lists.all_users")}</H2>
            <br />
        </div>
        {state.error ? <>
            <FormError>
                {t("lists.users_error")}<br />{t("lists.try_reload")}
            </FormError>
            <BrokenShards />
        </> : <>
            <Table headings={[t("name"), t("team")]} data={
                state.data.map(x => [x.username, x.team_name, { link: "/profile/" + x.id }])
            } />
            {state.hasMore && <Row>
                <Button disabled={state.loading} onClick={next}>Load More</Button>
            </Row>}
        </>}
    </Page>;
};
