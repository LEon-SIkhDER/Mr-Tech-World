import React from 'react';

const customizeImageWidth = (url, width) => {
    return url.replace(
        "/image/upload/",
        `/image/upload/w_${width}/`
    );
};

export default customizeImageWidth;