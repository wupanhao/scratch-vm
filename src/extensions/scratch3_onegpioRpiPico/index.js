/*
This is the Scratch 3 extension to remotely control an
Arduino Uno, ESP-8666, or Raspberry Pi


 Copyright (c) 2019 Alan Yorinks All rights reserved.

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 Version 3 as published by the Free Software Foundation; either
 or (at your option) any later version.
 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
 along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

// Boiler plate from the Scratch Team
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');


// The following are constants used within the extension

// Digital Modes
const DIGITAL_INPUT = 1;
const DIGITAL_OUTPUT = 2;
const PWM = 3;
const SERVO = 4;
const SONAR = 5;
const ANALOG_INPUT = 6;

// an array to save the current pin mode
// this is common to all board types since it contains enough
// entries for all the boards.
// Modes are listed above - initialize to invalid mode of -1
let pin_modes = new Array(30).fill(-1);

// has an websocket message already been received
let alerted = false;

let connection_pending = false;

// general outgoing websocket message holder
let msg = null;

// the pin assigned to the sonar trigger
// initially set to -1, an illegal value
let sonar_report_pin = -1;

// flag to indicate if the user connected to a board
let connected = false;

// arrays to hold input values
let digital_inputs = new Array(32);
let analog_inputs = new Array(8);

// flag to indicate if a websocket connect was
// ever attempted.
let connect_attempt = false;

// an array to buffer operations until socket is opened
let wait_open = [];

let the_locale = null;

// common
const FormDigitalWrite = {
    'pt-br': 'Escrever Pino Digital [PIN]como[ON_OFF]',
    'pt': 'Escrever Pino Digital[PIN]como[ON_OFF]',
    'en': 'Write Digital Pin [PIN] [ON_OFF]',
    'fr': 'Mettre la pin numérique[PIN]à[ON_OFF]',
    'zh-tw': '腳位[PIN]數位輸出[ON_OFF]',
    'zh-cn': '引脚[PIN]数字输出[ON_OFF]',
    'pl': 'Ustaw cyfrowy Pin [PIN] na [ON_OFF]',
    'de': 'Setze digitalen Pin [PIN] [ON_OFF]',
    'ja': 'デジタル・ピン [PIN] に [ON_OFF] を出力',
};

const FormPwmWrite = {
    'pt-br': 'Escrever Pino PWM[PIN]com[VALUE]%',
    'pt': 'Escrever Pino PWM[PIN]com[VALUE]%',
    'en': 'Write PWM Pin [PIN] [VALUE]%',
    'fr': 'Mettre la pin PWM[PIN]à[VALUE]%',
    'zh-tw': '腳位[PIN]類比輸出[VALUE]%',
    'zh-cn': '引脚[PIN]模拟输出[VALUE]%',
    'pl': 'Ustaw PWM Pin [PIN] na [VALUE]%',
    'de': 'Setze PWM-Pin [PIN] [VALUE]%',
    'ja': 'PWM ピン [PIN] に [VALUE]% を出力',
};

const FormTone = {
    'pt-br': 'Soar no Pino[PIN]com[FREQ]Hz e[DURATION]ms',
    'pt': 'Soar no Pino[PIN]com[FREQ]Hz  e[DURATION]ms',
    'en': 'Tone Pin [PIN] [FREQ] Hz [DURATION] ms',
    'fr': 'Définir le buzzer sur la pin[PIN]à[FREQ]Hz pendant[DURATION] ms',
    'zh-tw': '腳位[PIN]播放音調，頻率為[FREQ]赫茲 時間為[DURATION]毫秒',
    'zh-cn': '引脚[PIN]播放音调，频率为[FREQ]赫兹 时间为[DURATION]毫秒',
    'pl': 'Ustaw brzęczyk na Pinie [PIN] na [FREQ] Hz i [DURATION] ms%',
    'de': 'Spiele Ton am Pin [PIN] [FREQ] Hz [DURATION] ms',
    'ja': '音調ピン [PIN] を [FREQ] Hz [DURATION] ms に',
};

const FormServo = {
    'pt-br': 'Mover Servo Motor no[PIN]para[ANGLE]°',
    'pt': 'Mover Servo Motor no[PIN]para[ANGLE]°',
    'en': 'Write Servo Pin [PIN] [ANGLE] Deg.',
    'fr': 'Mettre le servo[PIN]à[ANGLE] Deg.',
    'zh-tw': '伺服馬達腳位[PIN]轉動角度到[ANGLE]度',
    'zh-cn': '伺服电机脚位[PIN]转动角度到[ANGLE]度',
    'pl': 'Ustaw silnik servo na Pinie [PIN] na [ANGLE]°',
    'de': 'Setze Servo-Pin [PIN] [ANGLE]°',
    'ja': 'サーボ・ピン [PIN] に [ANGLE] 度を出力',
};

const FormAnalogRead = {
    'pt-br': 'Ler Pino Analógico [PIN]',
    'pt': 'Ler Pino Analógico [PIN]',
    'en': 'Read Analog Pin [PIN]',
    'fr': 'Lecture analogique [PIN]',
    'zh-tw': '讀取類比腳位[PIN]',
    'zh-cn': '读取模拟引脚[PIN]',
    'pl': 'Odczytaj analogowy Pin [PIN]',
    'de': 'Lies analogen Pin [PIN]',
    'ja': 'アナログ・ピン [PIN] から入力',
};

const FormDigitalRead = {
    'pt-br': 'Ler Pino Digital [PIN]',
    'pt': 'Ler Pino Digital [PIN]',
    'en': 'Read Digital Pin [PIN]',
    'fr': 'Lecture numérique [PIN]',
    'zh-tw': '讀取數位腳位[PIN]',
    'zh-cn': '读取数字引脚[PIN]',
    'pl': 'Odczytaj cyfrowy Pin [PIN]',
    'de': 'Lies digitalen Pin [PIN]',
    'ja': 'デジタル・ピン [PIN] から入力',
};

const FormSonarRead = {
    'pt-br': 'Ler Distância: Sonar em T[TRIGGER_PIN] E[ECHO_PIN]',
    'pt': 'Ler Distância: Sonar em T[TRIGGER_PIN] E[ECHO_PIN]',
    'en': 'Read SONAR  T [TRIGGER_PIN]  E [ECHO_PIN]',
    'fr': 'Distance de lecture : Sonar T [TRIGGER_PIN] E [ECHO_PIN]',
    'zh-tw': 'HCSR超音波感測器，Echo在腳位[ECHO_PIN] Trig在腳位[TRIGGER_PIN]',
    'zh-cn': 'HCSR超声波传感器，Echo在引脚[ECHO_PIN] Trig在引脚[TRIGGER_PIN]',
    'pl': 'Odczytaj odległość: Sonar T [TRIGGER_PIN]  E [ECHO_PIN]',
    'de': 'Lies Sonar T [TRIGGER_PIN]  E [ECHO_PIN]',
    'ja': '超音波測距器からトリガ [TRIGGER_PIN] とエコー [ECHO_PIN] で入力',
};

// ESP-8266 specific

const FormIPBlockE = {
    'pt-br': 'Endereço IP da placa ESP-8266 [IP_ADDR]',
    'pt': 'Endereço IP da placa ESP-8266 [IP_ADDR]',
    'en': 'ESP-8266 IP Address [IP_ADDR]',
    'fr': "Adresse IP de l'ESP-8266 [IP_ADDR]",
    'zh-tw': 'ESP-8266 IP 位址[IP_ADDR]',
    'zh-cn': 'ESP-8266 IP 地址[IP_ADDR]',
    'pl': 'Adres IP ESP-8266 [IP_ADDR]',
    'de': 'ESP-8266 IP-Adresse [IP_ADDR]',
    'ja': 'ESP-8266 の IP アドレスを [IP_ADDR] に',
};

// Raspbery Pi Specific
const FormIPBlockR = {
    'pt-br': 'Endereço IP do RPi [IP_ADDR]',
    'pt': 'Endereço IP do RPi [IP_ADDR]',
    'en': 'Remote IP Address [IP_ADDR]',
    'fr': 'Adresse IP du RPi [IP_ADDR]',
    'zh-tw': '遠端 IP 位址[IP_ADDR]',
    'zh-cn': '远程 IP 地址[IP_ADDR]',
    'pl': 'Adres IP Rasberry Pi [IP_ADDR]',
    'de': 'IP-Adresse des RPi [IP_ADDR]',
    'ja': 'ラズパイの IP アドレスを [IP_ADDR] に',
};

// General Alert
const FormWSClosed = {
    'pt-br': "A Conexão do WebSocket está Fechada",
    'pt': "A Conexão do WebSocket está Fechada",
    'en': "WebSocket Connection Is Closed.",
    'fr': "La connexion WebSocket est fermée.",
    'zh-tw': "網路連線中斷",
    'zh-cn': "网络连接中断",
    'pl': "Połączenie WebSocket jest zamknięte.",
    'de': "WebSocket-Verbindung geschlossen.",
    'ja': "ウェブソケット接続が切断されています",
};

// ESP-8266 Alert
const FormAlrt = {
    'pt-br': {
        title: "Atenção",
        text: "Informe o endereço IP da placa ESP-8266 no bloco apropriado",
        icon: "info",
    },
    'pt': {
        title: "Atenção",
        text: "Informe o endereço IP da placa ESP-8266 no bloco apropriado",
        icon: "info",
    },
    'en': {
        title: "Reminder",
        text: "Enter the IP Address of the ESP-8266 Into The IP Address Block",
        icon: "info",
    },
    'fr': {
        title: "Attention",
        text: "Entrez l'adresse IP de l'ESP-8266 dans le bloc approprié.",
        icon: "info",
    },
    'zh-tw': {
        title: "提醒",
        text: "請於 IP 位址積木中輸入 ESP-8266 的 IP 位址",
        icon: "info",
    },
    'zh-cn': {
        title: "提醒",
        text: "请于 IP 地址积木中输入 ESP-8266 的 IP 地址",
        icon: "info",
    },
    'pl': {
        title: "Przypomnienie",
        text: "Wprowadź adres IP ESP-8266 do bloku adresu IP",
        icon: "info",
    },
    'de': {
        title: "Wichtig",
        text: "Trage die IP-Adresse des ESP-8266 im Blcok IP-Adresse ein",
        icon: "info",
    },
    'ja': {
        title: "注意",
        text: "ESP-8266 の IP アドレスを IP アドレス・ブロックに記入して下さい",
        icon: "info",
    },
};

class Scratch3RpiPicoOneGPIO {
    constructor(runtime) {
        the_locale = this._setLocale();
        this.runtime = runtime;
    }

    getInfo() {
        the_locale = this._setLocale();
        this.connect();

        return {
            id: 'onegpioRpiPico',
            // color1: '#0C5986',
            // color2: '#34B0F7',
            name: 'Raspberry Pi Pico',
            blockIconURI: 'data:image/png;base64,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',
            blocks: [
                {
                    opcode: 'digital_write',
                    blockType: BlockType.COMMAND,
                    //text: 'Write Digital Pin [PIN] [ON_OFF]',
                    text: FormDigitalWrite[the_locale],

                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '2',
                            menu: "digital_pins"
                        },
                        ON_OFF: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0',
                            menu: "on_off"
                        }
                    }
                },
                {
                    opcode: 'pwm_write',
                    blockType: BlockType.COMMAND,
                    text: FormPwmWrite[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '3',
                            menu: 'pwm_pins'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50',
                        }
                    }
                },
                '---',

                {
                    opcode: 'servo',
                    blockType: BlockType.COMMAND,
                    text: FormServo[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '2',
                            menu: 'digital_pins'
                        },
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90,
                        },

                    }
                },
                '---',
                {
                    opcode: 'analog_read',
                    blockType: BlockType.REPORTER,
                    text: FormAnalogRead[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0',
                            menu: 'analog_pins'
                        },
                        PULL: {
                            type: ArgumentType.STRING,
                            defaultValue: '-',
                            menu: 'pull'
                        },
                    }
                },
                '---',
                {
                    opcode: 'digital_read',
                    blockType: BlockType.REPORTER,
                    text: FormDigitalRead[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '2',
                            menu: 'digital_pins'
                        },
                    }
                },
                '---',
                {
                    opcode: 'sonar_read',
                    blockType: BlockType.REPORTER,
                    text: FormSonarRead[the_locale],

                    arguments: {
                        TRIGGER_PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '7',
                            menu: 'digital_pins'
                        },
                        ECHO_PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '8',
                            menu: 'digital_pins'
                        }
                    }
                },
            ],
            menus: {
                digital_pins: {
                    acceptReporters: true,
                    items: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
                        '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '25',
                        '26', '27', '28']
                },
                pwm_pins: {
                    acceptReporters: true,
                    items: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
                        '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '25',
                        '26', '27', '28']
                },
                analog_pins: {
                    acceptReporters: true,
                    items: ['0', '1', '2', '3',]
                },

                mode: {
                    acceptReporters: true,
                    items: [{ text: "Input", value: '1' }, { text: "Output", value: '2' }]
                },
                on_off: {
                    acceptReporters: true,
                    items: ['0', '1']
                },
                pull: {
                    acceptReporters: true,
                    items: ['^', '-']
                }
            }
        };
    }

    // The block handlers

    // command blocks

    digital_write(args) {
        if (!connected) {
            if (!connection_pending) {
                this.connect();
                connection_pending = true;
            }

        }

        if (!connected) {
            let callbackEntry = [this.digital_write.bind(this), args];
            wait_open.push(callbackEntry);
        } else {
            let pin = args['PIN'];
            pin = parseInt(pin, 10);

            if (pin_modes[pin] !== DIGITAL_OUTPUT) {
                pin_modes[pin] = DIGITAL_OUTPUT;
                msg = { "command": "set_mode_digital_output", "pin": pin };
                msg = JSON.stringify(msg);
                this.socket.send(msg);
            }
            let value = args['ON_OFF'];
            value = parseInt(value, 10);
            msg = { "command": "digital_write", "pin": pin, "value": value };
            msg = JSON.stringify(msg);
            this.socket.send(msg);
        }
    }

    //pwm
    pwm_write(args) {
        if (!connected) {
            if (!connection_pending) {
                this.connect();
                connection_pending = true;
            }
        }

        if (!connected) {
            let callbackEntry = [this.pwm_write.bind(this), args];
            wait_open.push(callbackEntry);
        } else {
            let pin = args['PIN'];
            // maximum value for RPi and Arduino
            let the_max = 255;
            pin = parseInt(pin, 10);

            let value = args['VALUE'];
            // value = parseInt(value, 10);

            // calculate the value based on percentage
            // value = the_max * (value / 100);
            // value = Math.round(value);
            if (pin_modes[pin] !== PWM) {
                pin_modes[pin] = PWM;
                msg = { "command": "set_mode_pwm", "pin": pin };
                msg = JSON.stringify(msg);
                this.socket.send(msg);
            }
            value = parseInt(value, 10);
            if (value >= 100) {
                value = 99;
            }
            msg = { "command": "pwm_write", "pin": pin, "value": value };
            msg = JSON.stringify(msg);
            this.socket.send(msg);

        }
    }

    // move servo
    servo(args) {
        if (!connected) {
            if (!connection_pending) {
                this.connect();
                connection_pending = true;
            }
        }
        if (!connected) {
            let callbackEntry = [this.servo.bind(this), args];
            wait_open.push(callbackEntry);
        } else {
            let pin = args['PIN'];
            pin = parseInt(pin, 10);
            let angle = args['ANGLE'];
            angle = parseInt(angle, 10);


            if (pin_modes[pin] !== SERVO) {
                pin_modes[pin] = SERVO;
                msg = { "command": "set_mode_servo", "pin": pin };
                msg = JSON.stringify(msg);
                this.socket.send(msg);
            }
            msg = {
                'command': 'servo_position', "pin": pin,
                'position': angle
            };
            msg = JSON.stringify(msg);
            this.socket.send(msg);

        }
    }

    // reporter blocks
    analog_read(args) {
        if (!connected) {
            if (!connection_pending) {
                this.connect();
                connection_pending = true;
            }
        }
        if (!connected) {
            let callbackEntry = [this.analog_read.bind(this), args];
            wait_open.push(callbackEntry);
        } else {
            let pin = args['PIN'];
            pin = parseInt(pin, 10);

            if (pin_modes[pin] !== ANALOG_INPUT) {
                pin_modes[pin] = ANALOG_INPUT;
                msg = { "command": "set_mode_analog_input", "pin": pin };
                msg = JSON.stringify(msg);
                this.socket.send(msg);
            }
            return analog_inputs[pin];

        }
    }

    digital_read(args) {
        if (!connected) {
            if (!connection_pending) {
                this.connect();
                connection_pending = true;
            }
        }
        if (!connected) {
            let callbackEntry = [this.digital_read.bind(this), args];
            wait_open.push(callbackEntry);
        } else {
            let pin = args['PIN'];
            let pull = '^'
            pin = parseInt(pin, 10);

            if (pin_modes[pin] !== DIGITAL_INPUT) {
                pin_modes[pin] = DIGITAL_INPUT;
                msg = { "command": "set_mode_digital_input", "pin": pin, "pull": pull };
                msg = JSON.stringify(msg);
                this.socket.send(msg);
            }
            return digital_inputs[pin];

        }
    }

    sonar_read(args) {
        if (!connected) {
            if (!connection_pending) {
                this.connect();
                connection_pending = true;
            }
        }
        if (!connected) {
            let callbackEntry = [this.sonar_read.bind(this), args];
            wait_open.push(callbackEntry);
        } else {
            let trigger_pin = args['TRIGGER_PIN'];
            trigger_pin = parseInt(trigger_pin, 10);
            sonar_report_pin = trigger_pin;
            let echo_pin = args['ECHO_PIN'];
            echo_pin = parseInt(echo_pin, 10);


            if (pin_modes[trigger_pin] !== SONAR) {
                pin_modes[trigger_pin] = SONAR;
                msg = { "command": "set_mode_sonar", "trigger_pin": trigger_pin, "echo_pin": echo_pin };
                msg = JSON.stringify(msg);
                this.socket.send(msg);
            }
            return digital_inputs[sonar_report_pin];

        }
    }

    // end of block handlers

    _setLocale() {
        let now_locale = '';
        switch (formatMessage.setup().locale) {
            case 'pt-br':
            case 'pt':
                now_locale = 'pt-br';
                break;
            case 'en':
                now_locale = 'en';
                break;
            case 'fr':
                now_locale = 'fr';
                break;
            case 'zh-tw':
                now_locale = 'zh-tw';
                break;
            case 'zh-cn':
                now_locale = 'zh-cn';
                break;
            case 'pl':
                now_locale = 'pl';
                break;
            case 'ja':
                now_locale = 'ja';
                break;
            case 'de':
                now_locale = 'de';
                break;
            default:
                now_locale = 'en';
                break;
        }
        return now_locale;
    }

    // helpers
    connect() {
        if (connected) {
            // ignore additional connection attempts
            return;
        } else {
            connect_attempt = true;

            if (this.runtime.ros && this.runtime.ros.isConnected()) {
                this.socket = new WebSocket(`ws://${this.runtime.vm.ros.ip}:9006`);
            }
            else {
                this.socket = new WebSocket(`ws://${window.location.hostname}:9006`);
            }

            msg = JSON.stringify({ "id": "to_rpi_pico_gateway" });
        }


        // websocket event handlers
        this.socket.onopen = () => {

            digital_inputs.fill(0);
            analog_inputs.fill(0);
            pin_modes.fill(-1);
            // connection complete
            connected = true;
            connect_attempt = true;
            // the message is built above
            try {
                //ws.send(msg);
                this.socket.send(msg);

            } catch (err) {
                // ignore this exception
            }
            for (let index = 0; index < wait_open.length; index++) {
                let data = wait_open[index];
                data[0](data[1]);
            }
        };

        this.socket.onclose = () => {
            digital_inputs.fill(0);
            analog_inputs.fill(0);
            pin_modes.fill(-1);
            // if (alerted === false) {
            //     alerted = true;
            //     alert(FormWSClosed[the_locale]);
            // }
            connected = false;
            connection_pending = false
        };

        this.socket.onerror = (error) => {
            console.log(error)
            connected = false
            connection_pending = false
        }

        // reporter messages from the board
        this.socket.onmessage = (message) => {
            msg = JSON.parse(message.data);
            let report_type = msg["report"];
            let pin = null;
            let value = null;

            // types - digital, analog, sonar
            if (report_type === 'digital_input') {
                pin = msg['pin'];
                pin = parseInt(pin, 10);
                value = msg['value'];
                digital_inputs[pin] = value;
            } else if (report_type === 'analog_input') {
                pin = msg['pin'];
                pin = parseInt(pin, 10);
                value = msg['value'];
                analog_inputs[pin] = value;
            } else if (report_type === 'sonar_data') {
                value = msg['value'];
                digital_inputs[sonar_report_pin] = value;
            }
        };
    }

}

module.exports = Scratch3RpiPicoOneGPIO;
