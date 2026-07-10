const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Menu = require('../../util/menu');
const axios = require('axios').default;
const { EventSourcePolyfill } = require('event-source-polyfill');
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxIAAAsSAdLdfvwAAATjSURBVFhH7ZhNiCNFFMez4Pot89FdnVRVJzm4rpKZyaS7ujMzruBBcVX8OuxhQcGDV0UWdkX8Au+CqyvigihePHhXvMiClz3tgjqHBcWDlxGZWdjDgGDG+H+vujKdTJIZZzOZHPYPYdJd1VW//r9XrypTuKWJU61wu5DxSU8uvDFbmn8v0NFL06WomrUerkSpcUqE5pooL7VFZbktysvtAB8/bG6KMPmoWq3emXUdv4SKzzIM4LwwIai2wMfXKb6n7aDycFso86OU5u7skfGpAwcQ+ohys+0p86uvkp98nWyJcAmgCUP6Kv4se2w8cnAegZFrOm3h3sthGN5F7UEYLwhtrlpI9NHJv75uPMAPH7QsHCZm5yikaQuTP2XbzA++Nl/SdylrFfTZJEB6GSHNa3T/QGXhVtg5HyGFe1t+ycIB7PugsoKFQq5ZSIT7Ei0edluZ83TvwCRU42wxdDnHzgEu2YYDOOcc/VXxb4WCOQqoyy7MnjbrAL4c6ORzIZtP8KCjUn5BcM4xnHUu6IJDKHWySrko5OIJ9N/iFY02+6x10/ZrfiNE7V6e4Ga0E67Zcs7thEt/KRbr98yWGjVfNzeoP7XRXwdG7nN/SgcVXyoUHr2NJ9qP+jgHuMHOWbimhaOFpA0Xbk8nVwD/JkL+oafjNQdOkJ5KzvFk/1cEV6TBu3Jur3B4KW5bac/q9BM7XtrgZ4P5IjltX5hAzR/Hjj15B7XtWc65/nARVqsD6IVbQljJOedOeoGfkfHrJRRsXF/ka9V43DrMNbI9LeYW6f6e1N+5XM5hYgIgl7bhKOcAl4WV+zi4UnSG3cZ4xSp2FR1/QIsDoW7Z8ZP2VHD8Meq7q/o4NyTnehbEQDjap7dXf1FFz/oyNkGYYnfJVrh8KKb+Q9UFVybrsVp142lq665zgxaEzbkOnCY4O56Dcy+LHYfrI93Hwlkbfpgw5migondoMM6JzDnce46aAf5d/5zLO2dzDoV4ABztOPnSlI1HeSnN+3R/oKQ87gPiOk/u4GTjeWrzVeNdl3ND4di5DI7D2uucg8svMCwiHV8Nw2U+YAzVTFif98vJOg0cSMNwU5WFGST0DZuL9MGhFMndDw61bFBYOweJ/AJzL4vxStS2J3mlKAHcC9kl3EufsfWMJktagZ6vz5TTOW/vzuXg4Bz13S9cP+F49CoNRg4iFL/j1hE4tcoH0B1w5gyVptyO01kQvMB6cvim4Ui+NK+wg5jUV+Y6n07gMratjWL1BMF9TP1cWHfbDm3dNKuiOgI4EtUqmtC+OUKqzNt0fzqI6oFuvkXfCc4dwTrO5XOuK6yAG4VzOR0ROr7i9lVMjtNHeh7ORQCro35dZPBcaRpc1EcPx0IePmInd05iMudWB7zHOdUHblRh7Sds9C8ipH/zpJSPvD1ZSCobgLshZP0k990BN6IFsZsopJjsa4D9xZAMmqzh+gsh4vttnzE7109T1cXpImphqdKsed6D92W3aTv81hVhG/oDyrn9yFfRaeHgKB918vPYnRsm/IK7QCHN8nMjDGuzWdNkyFPxORde7Dr/0O+OrGkyFARLRewuf7qyQ7CBTD7NmidDVLzh3nrPIeKrQ/mv1iD5qm4hsx/nOKpdoyNb1jwZmpJxDMhNqoETt1ichJ5b9MqRyi5v6RBUKPwHiaGniNJyG+oAAAAASUVORK5CYII='
const menuIconURI = blockIconURI;

// MCP Extension for Scratch 3.0
class LepiMCP {
    constructor(runtime) {
        this.runtime = runtime;
        this.mcpServerUrl = 'http://192.168.50.148:9000/mcp'; // 默认MCP服务器地址
        this.tools = [];
        this.sessionId = null; // 存储会话ID
        this.id = 1;
        this.customHeaders = {}; // 存储自定义请求头
        this.serverType = 'json'; // 服务器类型：'json' 或 'sse'
        this.sseEndpoint = null; // SSE端点URL
        this.eventSource = null; // EventSource实例
        this.pendingRequests = {}; // 存储待处理的请求
    }

    getInfo() {
        return {
            id: 'lepiMCP',
            name: 'MCP工具',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'setServerType',
                    blockType: BlockType.COMMAND,
                    text: '设置服务器类型 [TYPE]',
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'serverTypes',
                            defaultValue: 'json'
                        }
                    }
                },
                {
                    opcode: 'addCustomHeader',
                    blockType: BlockType.COMMAND,
                    text: '添加请求头 [NAME] = [VALUE]',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Authorization'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Bearer token123'
                        }
                    }
                },
                {
                    opcode: 'removeCustomHeader',
                    blockType: BlockType.COMMAND,
                    text: '删除请求头 [NAME]',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Authorization'
                        }
                    }
                },
                {
                    opcode: 'clearCustomHeaders',
                    blockType: BlockType.COMMAND,
                    text: '清除所有自定义请求头'
                },
                {
                    opcode: 'getCustomHeaders',
                    blockType: BlockType.REPORTER,
                    text: '自定义请求头'
                },
                {
                    opcode: 'setServerUrl',
                    blockType: BlockType.COMMAND,
                    text: '设置MCP服务器地址 [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: this.mcpServerUrl
                        }
                    }
                },
                {
                    opcode: 'getToolList',
                    blockType: BlockType.COMMAND,
                    text: '更新可用MCP工具列表'
                },
                {
                    opcode: 'callTool',
                    blockType: BlockType.COMMAND,
                    text: '调用MCP工具 [TOOL_NAME] 参数 [PARAMETERS]',
                    arguments: {
                        TOOL_NAME: {
                            type: ArgumentType.STRING,
                            menu: 'tools'
                        },
                        PARAMETERS: {
                            type: ArgumentType.STRING,
                            defaultValue: '{}'
                        }
                    }
                },
                {
                    opcode: 'mcpToolParam',
                    blockType: BlockType.REPORTER,
                    text: 'MCP工具[TOOL]参数说明',
                    arguments: {
                        TOOL: {
                            type: ArgumentType.STRING,
                            menu: 'tools'
                        },
                    }
                },
                {
                    opcode: 'getLastResult',
                    blockType: BlockType.REPORTER,
                    text: 'MCP工具调用结果'
                },
            ],
            menus: {
                'tools': 'formatToolsName',
                'serverTypes': Menu.formatMenu3(['流式传输(http)', '服务器发送事件(sse)'], ['json', 'sse'])
            }
        };
    }

    formatToolsName(args) {
        return Menu.formatMenu2(this.tools.map(tool => tool.name))
    }

    mcpToolParam(args) {
        let name = args.TOOL
        let tool = this.tools.filter(tool => tool.name == name)
        if (tool.length == 1) {
            let schema = tool[0].inputSchema
            return JSON.stringify({ 'params': schema.properties, 'required': schema.required })
        } else {
            return '{}'
        }
    }

    // 设置服务器类型
    setServerType(args) {
        this.serverType = args.TYPE;
        console.log(`Server type set to: ${this.serverType}`);
        // 关闭现有的SSE连接
        this._closeSSEConnection();
    }

    // 添加自定义请求头
    addCustomHeader(args) {
        if (args.NAME && args.VALUE) {
            this.customHeaders[args.NAME] = args.VALUE;
            console.log(`Added custom header: ${args.NAME} = ${args.VALUE}`);
            console.log('Current custom headers:', this.customHeaders);
        }
    }

    // 删除自定义请求头
    removeCustomHeader(args) {
        if (args.NAME && this.customHeaders.hasOwnProperty(args.NAME)) {
            delete this.customHeaders[args.NAME];
            console.log(`Removed custom header: ${args.NAME}`);
            console.log('Current custom headers:', this.customHeaders);
        }
    }

    // 清除所有自定义请求头
    clearCustomHeaders() {
        this.customHeaders = {};
        console.log('All custom headers cleared');
    }

    // 获取所有自定义请求头
    getCustomHeaders() {
        return JSON.stringify(this.customHeaders);
    }

    // 设置服务器URL
    async setServerUrl(args) {
        this.mcpServerUrl = args.URL;
        this.sessionId = null; // 重置会话ID
        this.id = 1;
        this._closeSSEConnection();
        console.log(`MCP Server URL set to: ${this.mcpServerUrl}`);
        await this.getToolList();
    }

    // 调用MCP工具
    async callTool(args) {
        try {
            let lastResult = await this._callTool(args.TOOL_NAME, args.PARAMETERS);
            if (typeof lastResult == 'string') {
                lastResult = lastResult.slice(lastResult.indexOf('{'))
                lastResult = JSON.parse(lastResult)
            }
            if (lastResult.result && lastResult.result.content) {
                let content = lastResult.result.content
                if (content.length == 1 && content[0]) {
                    this.lastResult = content[0]
                } else {
                    this.lastResult = content
                }
            } else {
                this.lastResult = lastResult
            }
            return JSON.stringify(this.lastResult);
        } catch (error) {
            return JSON.stringify({ error: error.message });
        }
    }

    // 获取工具列表
    async getToolList() {
        try {
            let tools = await this._getTools();
            if (typeof tools == 'string') {
                tools = tools.slice(tools.indexOf('{'))
                tools = JSON.parse(tools)
            }
            if (tools.result && tools.result.tools) {
                this.tools = tools.result.tools
            } else {
                this.tools = []
            }
            console.log('Available tools:', this.tools);
            return JSON.stringify(this.tools);
        } catch (error) {
            console.log('Error getting tools:', error);
            return JSON.stringify({ error: error.message });
        }
    }

    // 获取最后结果
    getLastResult() {
        return JSON.stringify(this.lastResult || {});
    }

    // 获取基础请求头（包含会话ID和自定义请求头）
    _getBaseHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': this.serverType === 'sse' ? 'text/event-stream' : 'text/event-stream, application/json'
        };

        // 添加会话ID
        if (this.sessionId) {
            headers['Mcp-Session-Id'] = this.sessionId;
        }

        // 添加自定义请求头（自定义请求头优先级最高）
        Object.keys(this.customHeaders).forEach(key => {
            headers[key] = this.customHeaders[key];
        });

        return headers;
    }

    // 关闭SSE连接
    _closeSSEConnection() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            console.log('SSE connection closed');
        }
    }

    // 建立SSE连接
    async _establishSSEConnection() {
        if (this.serverType !== 'sse') {
            return;
        }

        // 如果已经有连接，先关闭
        this._closeSSEConnection();

        return new Promise((resolve, reject) => {
            try {
                const url = this.mcpServerUrl;
                console.log('Establishing SSE connection to:', url);

                // 使用EventSource建立连接
                this.eventSource = new EventSourcePolyfill(url, {
                    headers: this._getBaseHeaders(),
                    // withCredentials: true // 跨域携带凭证
                });

                this.eventSource.onopen = () => {
                    console.log('SSE connection established');
                };

                this.eventSource.onmessage = (event) => {
                    console.log('SSE message received:', event.data);
                    this._handleSSEMessage(event.data);
                };

                this.eventSource.addEventListener('endpoint', (event) => {
                    console.log('SSE endpoint event:', event.data);
                    try {
                        const data = JSON.parse(event.data);
                        if (data.endpoint) {
                            this.sseEndpoint = data.endpoint;
                        }
                    } catch (e) {
                        let sep = this.mcpServerUrl.lastIndexOf('/')
                        this.sseEndpoint = `${this.mcpServerUrl.slice(0, sep)}${event.data}`
                        console.error('Failed to parse endpoint event:', e);
                    }
                    resolve();
                });

                this.eventSource.onerror = (error) => {
                    console.error('SSE connection error:', error);
                    if (this.eventSource.readyState === EventSource.CLOSED) {
                        console.log('SSE connection closed');
                        reject(new Error('SSE connection failed'));
                    }
                };

                // 设置超时
                setTimeout(() => {
                    if (this.eventSource.readyState === EventSource.CONNECTING) {
                        this._closeSSEConnection();
                        reject(new Error('SSE connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                console.error('Failed to create SSE connection:', error);
                reject(error);
            }
        });
    }

    // 处理SSE消息
    _handleSSEMessage(data) {
        try {
            const message = JSON.parse(data);

            // 处理响应消息
            if (message.id && this.pendingRequests[message.id]) {
                const { resolve, reject, timeout } = this.pendingRequests[message.id];
                clearTimeout(timeout);
                delete this.pendingRequests[message.id];

                if (message.error) {
                    reject(new Error(message.error.message || 'SSE request failed'));
                } else {
                    resolve({ data: message });
                }
            }

            // 处理会话初始化响应
            if (message.result && message.result.sessionId) {
                this.sessionId = message.result.sessionId;
                console.log('Session ID from SSE:', this.sessionId);
            }
        } catch (error) {
            console.error('Failed to parse SSE message:', error);
        }
    }

    // 通过SSE发送请求
    async _sendSSERequest(body) {
        if (!this.eventSource || this.eventSource.readyState !== EventSource.OPEN) {
            await this._establishSSEConnection();
        }

        return new Promise((resolve, reject) => {
            const requestId = body.id || Date.now();
            body.id = requestId;

            // 设置超时
            const timeout = setTimeout(() => {
                if (this.pendingRequests[requestId]) {
                    delete this.pendingRequests[requestId];
                    reject(new Error('SSE request timeout'));
                }
            }, 30000);

            // 存储待处理的请求
            this.pendingRequests[requestId] = { resolve, reject, timeout };

            // 通过POST发送请求到SSE端点
            const requestUrl = this.sseEndpoint || this.mcpServerUrl;

            this._postRequest(requestUrl, body)
                .then(response => {
                    console.log(response)
                    // 如果直接返回了响应，处理它
                    // if (this.pendingRequests[requestId]) {
                    //     clearTimeout(timeout);
                    //     delete this.pendingRequests[requestId];
                    //     resolve(response);
                    // }
                })
                .catch(error => {
                    console.log(error)
                    // if (this.pendingRequests[requestId]) {
                    //     clearTimeout(timeout);
                    //     delete this.pendingRequests[requestId];
                    //     reject(error);
                    // }
                });
        });
    }

    // 通用POST请求
    async _postRequest(url, body) {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let res = await this.runtime.ros.proxyPost(
                encodeURI(url),
                JSON.stringify({ method: "CUSTOM_POST", headers: this._getBaseHeaders() }),
                JSON.stringify(body)
            );
            console.log('Proxy response:', res);
            return JSON.parse(res);
        } else {
            const response = await axios.post(url, body, {
                headers: this._getBaseHeaders(),
                timeout: 30000
            });
            return response;
        }
    }

    // 初始化会话（获取Session ID）
    async _initializeSession() {
        if (this.sessionId) {
            return this.sessionId;
        }

        console.log('Initializing MCP session...');
        let body = {
            jsonrpc: "2.0",
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: {
                    name: "scratch-mcp-client",
                    version: "1.0.0"
                }
            },
            id: this.id++
        }

        try {
            let response;

            if (this.serverType === 'sse') {
                // SSE模式：先建立连接，再发送初始化请求
                await this._establishSSEConnection();
                response = await this._sendSSERequest(body);
            } else {
                // JSON模式：直接POST请求
                response = await this._postRequest(this.mcpServerUrl, body);
            }

            // 处理响应
            let responseData = response.data || response;
            if (typeof responseData === 'string') {
                responseData = JSON.parse(responseData);
            }

            // 从响应头中获取Session ID
            const sessionId = response.headers?.['mcp-session-id'] || responseData.headers?.['mcp-session-id'];
            if (sessionId) {
                this.sessionId = sessionId;
                console.log('Session initialized with ID:', this.sessionId);
            } else if (responseData.result?.sessionId) {
                this.sessionId = responseData.result.sessionId;
                console.log('Session ID from response:', this.sessionId);
            } else {
                console.log('No session ID found');
            }

            // 发送 initialized 通知（某些MCP服务器需要）
            if (this.sessionId) {
                await this._sendInitialized();
            }

            return this.sessionId;
        } catch (error) {
            console.error('Failed to initialize session:', error);
            // 某些服务器可能不需要session，继续执行
            return null;
        }
    }

    // 发送 initialized 通知
    async _sendInitialized() {
        if (!this.sessionId) return;

        let body = {
            jsonrpc: "2.0",
            method: "notifications/initialized",
            params: {}
        }

        try {
            if (this.serverType === 'sse') {
                await this._sendSSERequest(body);
            } else {
                await this._postRequest(this.mcpServerUrl, body);
            }
            console.log('Initialized notification sent');
        } catch (error) {
            console.error('Failed to send initialized notification:', error);
        }
    }

    // 统一的工具调用方法
    async _callTool(toolName, parameters) {
        let params;
        try {
            params = typeof parameters === 'string' ? JSON.parse(parameters) : parameters;
        } catch (e) {
            params = {};
        }

        // 确保会话已初始化
        await this._initializeSession();

        let body = {
            id: this.id++,
            jsonrpc: "2.0",
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: params
            }
        }

        try {
            let response;

            if (this.serverType === 'sse') {
                response = await this._sendSSERequest(body);
            } else {
                response = await this._postRequest(this.mcpServerUrl, body);
            }

            let responseData = response.data || response;
            if (typeof responseData === 'string') {
                responseData = JSON.parse(responseData);
            }

            return responseData;
        } catch (error) {
            if (error.response) {
                // 如果是401或403，可能是session过期，尝试重新初始化
                if (error.response.status === 401 || error.response.status === 403) {
                    console.log('Session may have expired, reinitializing...');
                    this.sessionId = null;
                    await this._initializeSession();

                    // 重试一次
                    body.id = this.id++;
                    let retryResponse;

                    if (this.serverType === 'sse') {
                        retryResponse = await this._sendSSERequest(body);
                    } else {
                        retryResponse = await this._postRequest(this.mcpServerUrl, body);
                    }

                    let retryData = retryResponse.data || retryResponse;
                    if (typeof retryData === 'string') {
                        retryData = JSON.parse(retryData);
                    }

                    return retryData;
                }
                throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
            } else if (error.request) {
                throw new Error('网络请求失败，请检查网络连接');
            } else {
                throw error;
            }
        }
    }

    // 统一的获取工具列表方法
    async _getTools() {
        // 确保会话已初始化
        await this._initializeSession();

        let body = {
            jsonrpc: "2.0",
            method: "tools/list",
            id: this.id++
        }

        try {
            let response;

            if (this.serverType === 'sse') {
                response = await this._sendSSERequest(body);
            } else {
                response = await this._postRequest(this.mcpServerUrl, body);
            }

            let responseData = response.data || response;
            if (typeof responseData === 'string') {
                responseData = JSON.parse(responseData);
            }

            return responseData;
        } catch (error) {
            if (error.response) {
                // 如果是401或403，可能是session过期，尝试重新初始化
                if (error.response.status === 401 || error.response.status === 403) {
                    console.log('Session may have expired, reinitializing...');
                    this.sessionId = null;
                    await this._initializeSession();

                    // 重试一次
                    body.id = this.id++;
                    let retryResponse;

                    if (this.serverType === 'sse') {
                        retryResponse = await this._sendSSERequest(body);
                    } else {
                        retryResponse = await this._postRequest(this.mcpServerUrl, body);
                    }

                    let retryData = retryResponse.data || retryResponse;
                    if (typeof retryData === 'string') {
                        retryData = JSON.parse(retryData);
                    }

                    return retryData;
                }
                throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
            } else if (error.request) {
                throw new Error('网络请求失败，请检查网络连接');
            } else {
                throw error;
            }
        }
    }

    // 清理资源
    _cleanup() {
        this._closeSSEConnection();
    }
}

module.exports = LepiMCP;