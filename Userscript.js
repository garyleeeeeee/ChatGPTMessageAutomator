// ==UserScript==
// @name         ChatGPT Message Automator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically send a series of messages to ChatGPT, waiting for it to be ready between messages.
// @author       RWJ
// @match        https://chat.openai.com/*
// @grant        none
// @run-at document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 初始化消息队列
    let messagesQueue = [];
    let isSending = false;

    // 创建UI元素
    function createUI() {
        const container = document.createElement('div');
        const input = document.createElement('input');
        const addButton = document.createElement('button');

        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.zIndex = '10000';
        container.style.backgroundColor = 'white';
        container.style.padding = '10px';
        container.style.borderRadius = '5px';
        container.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';

        input.id = 'commandInput';
        input.placeholder = 'Enter command';
        input.style.marginRight = '5px';

        addButton.textContent = 'Add Command';
        addButton.onclick = function() {
    const commandsString = input.value.trim();
    if (commandsString) {
        // 使用指定的分隔符分割输入的字符串，得到问题数组
        const commands = commandsString.split('------').map(cmd => cmd.trim()).filter(cmd => cmd !== '');
        // 将分割后的每个问题添加到消息队列中
        commands.forEach(command => {
            if (command) messagesQueue.push(command);
        });

        input.value = ''; // 清空输入框

        if (!isSending && messagesQueue.length > 0) {
            // 如果当前没有发送操作，并且队列中有消息，则开始发送流程
            isSending = true;
            checkAndSendMessage();
        }
    }
};


        container.appendChild(input);
        container.appendChild(addButton);
        document.body.appendChild(container);
    }

    // 检查并发送消息
function checkAndSendMessage() {
    if (messagesQueue.length > 0) {
        const inputSelector = '#prompt-textarea'; // ChatGPT聊天输入框的选择器
        const inputElement = document.querySelector(inputSelector);
        const customInputSelector = '#commandInput'; // 自定义UI输入框的选择器
        const customInputElement = document.querySelector(customInputSelector);

        if (inputElement) {
            const message = messagesQueue[0]; // 取队列中的第一条消息，但不立即移除

            // 检查自定义UI输入框是否被聚焦
            if (document.activeElement !== customInputElement) {
                inputElement.focus(); // 如果自定义UI输入框没有被聚焦，则聚焦到ChatGPT的输入框
                inputElement.value = ''; // 清空输入框以确保粘贴操作成功
                document.execCommand('insertText', false, message); // 模拟粘贴操作

                // 检查发送按钮的状态
                const sendButtonSelector = '[data-testid="send-button"]'; // 发送按钮的选择器
                const sendButtonElement = document.querySelector(sendButtonSelector);
                if (sendButtonElement && !sendButtonElement.disabled) {
                    sendButtonElement.click(); // 点击发送按钮
                    messagesQueue.shift(); // 成功点击发送按钮后，移除队列中的第一条消息
                }
            }
        }
    }
    // 无论是否成功发送，均设置延时递归调用，以处理后续消息或重试当前消息
    setTimeout(checkAndSendMessage, 1000); // 适当调整时间间隔以适应页面响应
}




    // 初始化
    createUI();
})();
