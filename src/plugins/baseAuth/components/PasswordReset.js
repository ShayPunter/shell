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

import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect } from "react-router-dom";
import qs from "query-string";

import {
    Form, FormError, Page, Input, Button, FormGroup, Row, H2
} from "@ractf/ui-kit";
import { completePasswordReset } from "@ractf/api";
import { appContext, zxcvbn } from "ractf";
import { useReactRouter } from "@ractf/util";
import { Wrap } from "./Parts";
import http from "@ractf/http";


export default () => {
    const app = useContext(appContext);
    const [message, setMessage] = useState("");
    const [locked, setLocked] = useState(false);
    const { t } = useTranslation();

    const { location } = useReactRouter();
    const { id, secret } = qs.parse(location.search, { ignoreQueryPrefix: true });

    if (!(secret && id)) return <Redirect to={"/login"} />;

    const doReset = ({ passwd1, passwd2 }) => {
        if (passwd1 !== passwd2)
            return setMessage(t("auth.pass_match"));
        if (!passwd1)
            return setMessage(t("auth.no_pass"));

        const strength = zxcvbn()(passwd1);
        if (strength.score < 3)
            return setMessage((strength.feedback.warning || t("auth.pass_weak")));

        setLocked(true);
        completePasswordReset(id, secret, passwd1).then(() => {
            app.alert(t("auth.pass_reset"));
        }).catch(
            message => {
                setMessage(http.getError(message));
                setLocked(false);
            }
        );
    };

    return <Page vCentre>
        <Wrap>
            <Form locked={locked} handle={doReset}>
                <H2>{t("auth.reset_password")}</H2>

                <FormGroup>
                    <Input zxcvbn={zxcvbn()} name={"passwd1"} placeholder={t("new_pass")} password />
                    <Input name={"passwd2"} placeholder={t("password_repeat")} password />
                </FormGroup>

                {message && <FormError>{message}</FormError>}

                <Row right>
                    <Button large submit>{t("auth.reset")}</Button>
                </Row>
            </Form>
        </Wrap>
    </Page>;
};
