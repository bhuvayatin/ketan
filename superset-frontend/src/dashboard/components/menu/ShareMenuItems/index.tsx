/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import { useUrlShortener } from 'src/common/hooks/useUrlShortener';
import copyTextToClipboard from 'src/utils/copy';
import { t } from '@superset-ui/core';
import { Menu } from 'src/common/components';
import { getUrlParam } from 'src/utils/urlUtils';
import { URL_PARAMS } from 'src/constants';
import {
  createFilterKey,
  getFilterValue,
} from 'src/dashboard/components/nativeFilters/FilterBar/keyValue';

interface ShareMenuItemProps {
  url: string;
  copyMenuItemTitle: string;
  emailMenuItemTitle: string;
  emailSubject: string;
  emailBody: string;
  addDangerToast: Function;
  addSuccessToast: Function;
  dashboardId?: string;
}

const ShareMenuItems = (props: ShareMenuItemProps) => {
  const {
    url,
    copyMenuItemTitle,
    emailMenuItemTitle,
    emailSubject,
    emailBody,
    addDangerToast,
    addSuccessToast,
    dashboardId,
    ...rest
  } = props;

  const getShortUrl = useUrlShortener(url);

  async function getCopyUrl() {
    const risonObj = getUrlParam(URL_PARAMS.nativeFilters);
    if (typeof risonObj === 'object' || !dashboardId) return null;
    const prevData = await getFilterValue(
      dashboardId,
      getUrlParam(URL_PARAMS.nativeFiltersKey),
    );
    const newDataMaskKey = await createFilterKey(
      dashboardId,
      JSON.stringify(prevData),
    );
    const newUrl = new URL(`${window.location.origin}${url}`);
    newUrl.searchParams.set(URL_PARAMS.nativeFilters.name, newDataMaskKey);
    return `${newUrl.pathname}${newUrl.search}`;
  }

  async function onCopyLink() {
    try {
      const copyUrl = await getCopyUrl();
      const shortUrl = await getShortUrl(copyUrl);
      await copyTextToClipboard(shortUrl);
      addSuccessToast(t('Copied to clipboard!'));
    } catch (error) {
      addDangerToast(t('Sorry, your browser does not support copying.'));
    }
  }

  async function onShareByEmail() {
    try {
      const copyUrl = await getCopyUrl();
      const shortUrl = await getShortUrl(copyUrl);
      const bodyWithLink = `${emailBody}${shortUrl}`;
      window.location.href = `mailto:?Subject=${emailSubject}%20&Body=${bodyWithLink}`;
    } catch (error) {
      addDangerToast(t('Sorry, something went wrong. Try again later.'));
    }
  }

  return (
    <>
      <Menu.Item key="copy-url" {...rest}>
        <div onClick={onCopyLink} role="button" tabIndex={0}>
          {copyMenuItemTitle}
        </div>
      </Menu.Item>
      <Menu.Item key="share-by-email" {...rest}>
        <div onClick={onShareByEmail} role="button" tabIndex={0}>
          {emailMenuItemTitle}
        </div>
      </Menu.Item>
    </>
  );
};

export default ShareMenuItems;
