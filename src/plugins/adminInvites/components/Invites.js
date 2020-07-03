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

import React, { useCallback, useState } from "react";

import {
    Button, Column, PageHead, Card, Row, Form, FormGroup, Input, InputButton, NewModal
} from "@ractf/ui-kit";

import { INVITES, generateInvites } from "../api/invites";
import http from "@ractf/http";


const Invites = () => {
    const [invites, setInvites] = useState([]);
    const [locked, setLocked] = useState(false);

    const generate = useCallback((amount) => {
        setLocked(true);
        return generateInvites({ amount }).then(codes => {
            setInvites(codes);
            setLocked(false);
        }).catch(e => {
            setLocked(false);
            throw e;
        });
    }, []);
    const formCallback = useCallback(({ amount }, setFormState) => {
        generate(amount).then(
            () => setFormState(ofs => ({ ...ofs, disabled: false }))
        ).catch(e => {
            let errors = {};
            if ((e.response && e.response.data) && typeof e.response.data.d === "object")
                errors = e.response.data.d;
            setFormState(ofs => ({ ...ofs, errors: errors, disabled: false, error: http.getError(e) }));
            console.log(e);
        });
    }, [generate]);
    const generate1 = useCallback(() => generate(1), [generate]);
    const generate10 = useCallback(() => generate(10), [generate]);
    const generate100 = useCallback(() => generate(100), [generate]);

    const numValidator = useCallback(({ amount }) => {
        return new Promise((resolve, reject) => {
            if (!(/\d+/).test(amount)) return reject({ amount: "Number required" });
            resolve();
        });
    }, []);

    return <>
        <NewModal header={"Generated Invites:"} fullHeight show={invites.length} key={invites[0]}>
            {invites.map(i => <React.Fragment key={i}><code>{i}</code><br /></React.Fragment>)}
        </NewModal>

        <PageHead title={"Invites"} />
        <Row>
            <Column lgWidth={6} mdWidth={12}>
                <Card header={"Quick Generation"}>
                    <Row centre>
                        <Button onClick={generate1} disabled={locked}>Generate 1 Invite</Button>
                        <Button onClick={generate10} disabled={locked}>Generate 10 Invites</Button>
                        <Button onClick={generate100} disabled={locked}>Generate 100 Invites</Button>
                    </Row>
                </Card>
                <Card header={"Generate Invites"}>
                    <Form handle={formCallback} validator={numValidator} action={INVITES} locked={locked}>
                        <InputButton name={"amount"} format={/\d+/}
                            placeholder={"Number of invites"} button={"Generate"} />
                    </Form>
                </Card>
            </Column>
            <Column lgWidth={6} mdWidth={12}>
                <Card header={"Generate Single Invite"} >
                    <Form locked={locked}>
                        <FormGroup label={"Auto-join team ID"}>
                            <Input name={"team"} placeholder={"Auto-join team ID"} />
                        </FormGroup>
                        <FormGroup label={"Email"}>
                            <Input name={"email"} placeholder={"Email"} />
                        </FormGroup>
                        <FormGroup label={"Username"}>
                            <Input name={"username"} placeholder={"Username"} />
                        </FormGroup>
                        <Button submit>Generate</Button>
                    </Form>
                </Card>
            </Column>
            <Column lgWidth={12}>
                <Card header={"View existing invites"}>
                    <InputButton submit name={"name"} placeholder={"Search for Username"} button={"Search"} />
                </Card>
            </Column>
        </Row>
    </>;
};
export default Invites;
