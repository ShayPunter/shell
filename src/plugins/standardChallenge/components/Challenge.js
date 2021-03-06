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

import React, { useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import {
    Button, TextBlock, PageHead, Link, Row, FlashText, Markdown, Badge, Page
} from "@ractf/ui-kit";
import { appContext } from "ractf";
import { iteratePlugins, FlagForm } from "@ractf/plugins";
import { useHint } from "@ractf/api";
import http from "@ractf/http";

import Split from "./Split";
import File from "./File";
import Hint from "./Hint";

import "./Challenge.scss";


export default ({ challenge, category, rightComponent }) => {
    const onFlagResponse = useRef();
    const submitFlag = useRef();

    const user = useSelector(state => state.user);
    const app = useContext(appContext);

    const { t } = useTranslation();

    const promptHint = (hint) => {
        return () => {
            if (hint.used) return app.alert(hint.name + ":\n" + hint.text);

            const msg = <>
                Are you sure you want to use a hint?<br /><br />
                This hint will deduct {hint.penalty} points from this challenge.
            </>;
            app.promptConfirm({ message: msg, small: true }).then(() => {
                useHint(hint.id).then(body => {
                    app.alert(<>{hint.name}<br/><Markdown source={body.text} /></>);
                }).catch(e =>
                    app.alert("Error using hint:\n" + http.getError(e))
                );
            }).catch(() => { });
        };
    };

    const challengeMods = [];
    iteratePlugins("challengeMod").forEach(({ key, plugin }) => {
        if (!plugin.check || plugin.check(challenge, category)) {
            challengeMods.push(React.createElement(plugin.component, {
                challenge: challenge, category: category, key: key,
            }));
        }
    });

    let rightSide = null;
    if (rightComponent)
        rightSide = React.createElement(rightComponent, { challenge: challenge });

    const chalContent = <>
        {challengeMods}
        <Row>
            <TextBlock>
                <Markdown source={challenge.description} />
            </TextBlock>
        </Row>

        {challenge.files && !!challenge.files.length && <Row>
            {challenge.files.map(file =>
                file && <File name={file.name} url={file.url} size={file.size} key={file.id} id={file.id} />
            )}
        </Row>}
        {user.team && challenge.hints && !!challenge.hints.length && <Row>
            {challenge.hints && !challenge.solved && challenge.hints.map((hint, n) => {
                return <Hint name={hint.name} onClick={promptHint(hint)} hintUsed={hint.used}
                    points={hint.penalty} id={hint.id} key={hint.id} />;
            })}
        </Row>}

        {challenge.solved ? <Row>
            {t("challenge.already_solved")}
        </Row> : user.team ? <Row>
            <FlagForm challenge={challenge} submitRef={submitFlag} onFlagResponse={onFlagResponse.current} autoFocus />
        </Row> : <>
            <Row>
                <FlashText danger>{t("challenge.no_team")}</FlashText>
            </Row>
            <Row>
                <Button danger to={"/team/join"}>{t("join_a_team")}</Button>
                <Button danger to={"/team/new"}>{t("create_a_team")}</Button>
            </Row>
        </>}
    </>;

    const tags = <>
        <Badge pill primary>{category.name}</Badge>
        <Badge pill primary>{challenge.author}</Badge>
    </>;

    const solveMsg = (challenge.first_blood_name
        ? t("challenge.has_solve", { name: challenge.first_blood_name, count: challenge.solve_count })
        : t("challenge.no_solve"));

    const leftSide = <Page>
        <PageHead
            subTitle={<>{t("point_count", { count: challenge.score })} - {solveMsg}</>}
            back={<Link className={"backToChals"} to={".."}>{t("back_to_chal")}</Link>}
            title={challenge.name} tags={tags}
        />
        <Row style={{ position: "absolute", top: 16, right: 32 }} right>
            <Button to="#edit" danger>{t("edit")}</Button>
        </Row>
        {chalContent}
    </Page>;

    if (!rightSide) return leftSide;

    return <Page title={challenge ? challenge.name : "Challenges"} noWrap={!!rightSide}>
        <Split submitFlag={submitFlag.current} onFlagResponse={onFlagResponse}>
            {leftSide}
            {rightSide}
        </Split>
    </Page>;
};
