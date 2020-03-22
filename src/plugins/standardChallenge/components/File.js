import React, { useContext } from "react";
import { FaFile } from "react-icons/fa";

import { appContext, apiEndpoints } from "ractf";

import "./Challenge.scss";


export default ({ name, url, size, id, isEdit }) => {
    const endpoints = useContext(apiEndpoints);
    const app = useContext(appContext);

    const formatBytes = bytes => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const edit = () => {
        app.promptConfirm({message: "Edit file", remove: () => endpoints.removeFile(id)},
            [{name: 'name', placeholder: 'File name', label: "Name", val: name},
             {name: 'url', placeholder: 'File URL', label: "URL", val: url},
             {name: 'size', placeholder: 'File size', label: "Size (bytes)", val: size.toString(), format: /\d+/}]
        ).then(({ name, url, size }) => {

            if (!size.toString().match(/\d+/)) return app.alert("Invalid file size!");

            endpoints.editFile(id, name, url, size).then(() =>
                app.alert("File edited!")
            ).catch(e =>
                app.alert("Error editing file:\n" + endpoints.getError(e))
            );
        });
    };

    if (isEdit) {
        return <div className={"challengeLink"} onClick={() => edit()}>
            <FaFile />
            <div>
                <div>{name}</div>
                <div className={"linkStyle"} href={""}>{url}</div>
                <div className={"challengeLinkMeta"}>{formatBytes(size)}</div>
            </div>
        </div>;
    }

    return <div className={"challengeLink"}>
        <FaFile />
        <div>
            <a href={url} target={"_blank"}>{name}</a>
            <div className={"challengeLinkMeta"}>{formatBytes(size)}</div>
        </div>
    </div>;
};
