'use strict';

const loader = require('./index.js');
const loaderUtils = require('loader-utils');
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');

describe('jsxtremeMarkdownLoader', () => {
  let callback;
  let mockContext;
  let transformResult;
  let mockOptions;

  beforeEach(() => {
    mockContext = {
      loader,
      resource: 'mockResource'
    };
    mockOptions = {};
    transformResult = 'mockResult';
    jest.spyOn(loaderUtils, 'getOptions').mockReturnValue(mockOptions);
    jest.spyOn(jsxtremeMarkdown, 'toComponentModule').mockReturnValue(transformResult);
  });

  afterEach(() => {
    loaderUtils.getOptions.mockRestore();
    jsxtremeMarkdown.toComponentModule.mockRestore();
  });

  test('gets options', () => {
    mockContext.loader('mockMarkdown');
    expect(loaderUtils.getOptions).toHaveBeenCalledTimes(1);
    expect(loaderUtils.getOptions).toHaveBeenCalledWith(mockContext);
  });

  test('passes arguments to toComponentModule', () => {
    mockContext.loader('mockMarkdown');
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledTimes(1);
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledWith('mockMarkdown', mockOptions);
  });

  test('calls the callback with the results', () => {
    const result = mockContext.loader('mockMarkdown');
    expect(result).toBe('mockResult');
  });

  test('passes errors to the callback', () => {
    jsxtremeMarkdown.toComponentModule.mockImplementation(() => {
      throw new Error('mockError');
    });
    expect(() => mockContext.loader('mockMarkdown')).toThrow('mockError');
  });

  test('getWrapper function ends up providing options.wrapper', () => {
    const getWrapper = jest.fn(() => 'mockWrapper');
    loaderUtils.getOptions.mockReturnValue({ getWrapper });
    mockContext.loader('mockMarkdown');
    expect(getWrapper).toHaveBeenCalledTimes(1);
    expect(getWrapper).toHaveBeenCalledWith('mockResource');
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledTimes(1);
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledWith('mockMarkdown', {
      wrapper: 'mockWrapper'
    });
  });
});
