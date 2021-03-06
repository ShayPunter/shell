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

import React, { useContext } from "react";
import { FaFile } from "react-icons/fa";

import { removeFile, editFile } from "@ractf/api";
import { appContext } from "ractf";
import http from "@ractf/http";

import "./Challenge.scss";
import { Button } from "@ractf/ui-kit";


export default ({ name, url, size, id, isEdit }) => {
    const app = useContext(appContext);

    const formatBytes = bytes => {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const edit = () => {
        app.promptConfirm({ message: "Edit file", remove: () => removeFile(id) },
            [{ name: "name", placeholder: "File name", label: "Name", val: name },
            { name: "url", placeholder: "File URL", label: "URL", val: url },
            { name: "size", placeholder: "File size", label: "Size (bytes)", val: size.toString(), format: /\d+/ }]
        ).then(({ name, url, size }) => {

            if (!size.toString().match(/\d+/)) return app.alert("Invalid file size!");

            editFile(id, name, url, size).then(() =>
                app.alert("File edited!")
            ).catch(e =>
                app.alert("Error editing file:\n" + http.getError(e))
            );
        }).catch(() => { });
    };

    if (isEdit) {
        return <Button Icon={FaFile} tooltip={`${url}\n(${formatBytes(size)})`} onClick={() => edit()}>
            {name}
        </Button>;
    }

    return <Button to={url} Icon={FaFile} tooltip={formatBytes(size)} externalLink>
        {name}
    </Button>;
};
