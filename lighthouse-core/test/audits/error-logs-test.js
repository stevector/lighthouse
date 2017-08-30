/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* eslint-env mocha */

const ErrorLogsAudit = require('../../audits/error-logs.js');
const assert = require('assert');

describe('Console error logs audit', () => {
  it('passes when no console messages were found', () => {
    const auditResult = ErrorLogsAudit.audit({
      ChromeConsoleMessages: []
    });
    assert.equal(auditResult.rawValue, 0);
    assert.equal(auditResult.score, true);
    assert.ok(!auditResult.displayValue, 0);
    assert.equal(auditResult.optimalValue, 0);
    assert.equal(auditResult.details.items.length, 0);
  });

  it('fails when error logs are found ', () => {
    const expectedOutcome =
        [
          [
            {
              type: 'text',
              text: 'network',
            },
            {
              type: 'text',
              text: `The server responded with a status of 404 (Not Found)`,
            },
            {
              type: 'text',
              text: 'http://www.example.com/favicon.ico',
            }
          ],
          [
            {
              type: 'text',
              text: 'javascript',
            },
            {
              type: 'text',
              text: 'WebSocket connection failed: Unexpected response code: 500',
            },
            {
              type: 'text',
              text: 'http://www.example.com/wsconnect.ws',
            }
          ]
        ];

    const auditResult = ErrorLogsAudit.audit({
      ChromeConsoleMessages: [
        {
          entry: {
            level: 'error',
            source: 'network',
            text: 'The server responded with a status of 404 (Not Found)',
            url: 'http://www.example.com/favicon.ico'
          }
        }, {
          entry: {
            level: 'error',
            source: 'javascript',
            text: 'WebSocket connection failed: Unexpected response code: 500',
            url: 'http://www.example.com/wsconnect.ws'
          }
        }
      ]
    });
    assert.equal(auditResult.rawValue, 2);
    assert.equal(auditResult.score, false);
    assert.equal(auditResult.displayValue, 2);
    assert.equal(auditResult.details.items.length, 2);
    assert.deepStrictEqual(
      auditResult.details.items,
      expectedOutcome
    );
  });

  it('handle the case when some logs fields are undefined', () => {
    const expectedOutcome =
        [
          [
            {
              type: 'text',
              text: undefined,
            },
            {
              type: 'text',
              text: undefined,
            },
            {
              type: 'text',
              text: undefined,
            }
          ]
        ];

    const auditResult = ErrorLogsAudit.audit({
      ChromeConsoleMessages: [
        {
          entry: {
            level: 'error',
          }
        }
      ]
    });
    assert.equal(auditResult.rawValue, 1);
    assert.equal(auditResult.score, false);
    assert.equal(auditResult.displayValue, 1);
    assert.equal(auditResult.details.items.length, 1);
    assert.deepStrictEqual(
      auditResult.details.items,
      expectedOutcome
    );
  });
});
