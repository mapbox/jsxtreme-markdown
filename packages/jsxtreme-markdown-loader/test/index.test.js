'use strict';

const loader = require('../index.js');
const loaderUtils = require('loader-utils');
const jsxtremeMarkdown = require('@mapbox/jsxtreme-markdown');

describe('jsxtremeMarkdownLoader', () => {
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
    jest
      .spyOn(jsxtremeMarkdown, 'toComponentModule')
      .mockReturnValue(transformResult);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('gets options', () => {
    mockContext.loader('mockMarkdown');
    expect(loaderUtils.getOptions).toHaveBeenCalledTimes(1);
    expect(loaderUtils.getOptions).toHaveBeenCalledWith(mockContext);
  });

  test('passes arguments to toComponentModule', () => {
    mockContext.loader('mockMarkdown');
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledTimes(1);
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledWith(
      'mockMarkdown',
      { precompile: true }
    );
  });

  test('turn off precompilation', () => {
    loaderUtils.getOptions.mockReturnValue({ precompile: false });
    mockContext.loader('mockMarkdown');
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledTimes(1);
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledWith(
      'mockMarkdown',
      { precompile: false }
    );
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
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledWith(
      'mockMarkdown',
      {
        wrapper: 'mockWrapper',
        precompile: true
      }
    );
  });

  test('result of getWrapper is independent for each invocation', () => {
    const getWrapper = jest.fn(resource => {
      if (resource === 'a') return 'AAA';
      if (resource === 'b') return 'BBB';
      return 'CCC';
    });
    loaderUtils.getOptions.mockReturnValue({ getWrapper });

    mockContext = { loader, resource: 'a' };
    mockContext.loader('mockMarkdownA');
    expect(getWrapper).toHaveBeenCalledTimes(1);
    expect(getWrapper).toHaveBeenCalledWith('a');
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledTimes(1);
    expect(jsxtremeMarkdown.toComponentModule.mock.calls[0]).toEqual([
      'mockMarkdownA',
      {
        wrapper: 'AAA',
        precompile: true
      }
    ]);

    mockContext = { loader, resource: 'b' };
    mockContext.loader('mockMarkdownB');
    expect(getWrapper).toHaveBeenCalledTimes(2);
    expect(getWrapper).toHaveBeenCalledWith('b');
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledTimes(2);
    expect(jsxtremeMarkdown.toComponentModule.mock.calls[1]).toEqual([
      'mockMarkdownB',
      {
        wrapper: 'BBB',
        precompile: true
      }
    ]);

    mockContext = { loader, resource: 'c' };
    mockContext.loader('mockMarkdownC');
    expect(getWrapper).toHaveBeenCalledTimes(3);
    expect(getWrapper).toHaveBeenCalledWith('c');
    expect(jsxtremeMarkdown.toComponentModule).toHaveBeenCalledTimes(3);
    expect(jsxtremeMarkdown.toComponentModule.mock.calls[2]).toEqual([
      'mockMarkdownC',
      {
        wrapper: 'CCC',
        precompile: true
      }
    ]);
  });
});
