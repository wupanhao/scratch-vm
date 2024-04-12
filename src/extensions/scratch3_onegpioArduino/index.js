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
const TONE = 5;
const SONAR = 6;
const ANALOG_INPUT = 7;

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
    'zh-cn': '伺服电机引脚[PIN]转动角度到[ANGLE]度',
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
        text: "请于 IP地址积木中输入 ESP-8266 的 IP 地址",
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


class Scratch3ArduinoOneGPIO {
    constructor(runtime) {
        the_locale = this._setLocale();
        this.runtime = runtime;
        this.connect()

    }

    getInfo() {
        the_locale = this._setLocale();
        this.connect();

        return {
            id: 'onegpioArduino',
            // color1: '#0C5986',
            // color2: '#34B0F7',
            name: 'Arduino',
            blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAAEwUlEQVRYR+2XaUxcVRTH/5dZmDoLw1JaZECqVAXBKIn6gQI2bUyNYiQh1hibNBpTItYywyK2glDiAkEwom1j1OgnjaZqGo0maiJtjYlLJSHa4JJqwSJrWcoyZYbnuffdefBgoMAwygd+kzvnnPte3vzfuecuw6K+alSwhomQds2yLjBU1gWGypoXqFtmhneUSS90WFktlMZnZQQcaWnB43/0QWmuBSutAYuYn5utcTHouc0rIxXtrpHPxqQXHs5OTAEG+XPjE0L83PZr5X48d+q8eo9EZJCLO1W8FzmvvS27Q8RogkIfRh/4SBiPvZNgkRY1JrigYLxa8yQO5STLSGZQGb2E7JRk/F3lEZ2h0pK6CSfzt6M1/07AZhf2ZOEufFOwU1xvSIwSdikIgcxuAyuqQGJdk+gMlZvT0qRHLz8wIKzf74fP5xN+eeeQsEtBq0EukrM10oA0ixHp1Ew0Qkbq4z7vu4maovChg4h5SzYZRF+mxSTiDGp5H30hnrXBYKBhNcNqNMBAfu4Hn4t+FkGDv6doXguGVoOchepiubDql2giXJLRAjB6TSbzM+0XZtFZvNoododq6aVfdjl1L88zvvOHr6E0PCNaTGB2ByFsAtnoiGppPSzpGhJ2Nmo1qvhJ8EKETWCAVDPVKGUvdVpdXgLMFjXkn5befHQ1GA4U/uO0e+DRErDoaNkbnFWtweJ4BzzxdhnpCdQbrzUx5T0UR0VBmQ6eqdrYSOnNRxPYdE2s+mCTCUc3W5GwSOFyMi//BdfIbzLSw8rrhD2ecyuO52bpWu6mWHGtMisd9cYLwq9+uhKKObhITcXExLj0gKKyMnSf+U5GwSkaioZncrOM9Ly7axsNrV9kcG5r/adf3BNBy4wZakYL7tpGs2b2tJlBE3iwokJ16MG7770H0a6Z/XC5PLhjO30zDP7Sip7OLhQW3I/C023CHklywj3Yjud//Blun0vc766uB5Nr4VxmxtFG6xZfu6hO3r/xdgz+9L28sEJot9h30YknztNWx2uQsseXmuKuYTTHZMqbVPI+/lJ689EE9nRfANtXKiOibfEhXoze94BrzXyTBO5o/YQKnGYxb8RjcVYcsAwL/42MFLyZuQUvJtiFdcdYUNdhRXNXPJo6N4p7hEB+mom3WbXTDK+Vt46mC38lxH/biHNT6pAlJCYKG+D13lGYnUkyujLaOqiMjYNZr5LdJPKyA8ys7gbL5XTGK8hu30/bLV9j6FlyeQmconkC+DWeQW77+vuxMS4OXq8XUzRZbFaruMeT1Kdm0HG3VSeOs1JxnOy9A5o4zp44G97Jul74fOF2D7QJfyloNchFrhqH6qWjwrc7h0M9PHDESXuJaAJXk97Mp3AdiQpQMzCJgvvyxUbAaANw3UInbUlAKreabBpePsScsAh0PWzE71658Fo2QHnhoOpLPCUHhDV0ncHQxUFUdo/ikfZzaBqcRNUNY3BT7ZUmywVdfK8yUyVVuhrkpKWnw+l0yojOD1Hj6LNugY8S1ZAUq217cwnb/+JgaMNWfljYw3RIeGj3A/jwxKcwDP+JY5Ep/92J+krkxdhhsVhwtqODT22cMF4tr+jRZXAt8r9lcKmsCwyVdYGhssYFAv8CuAyq50y1gkEAAAAASUVORK5CYII=',
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
                    opcode: 'tone_on',
                    blockType: BlockType.COMMAND,
                    text: FormTone[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '2',
                            menu: 'digital_pins'
                        },
                        FREQ: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50,
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
                        '12', '13', '14', '15', '16', '17', '18', '19']
                },
                pwm_pins: {
                    acceptReporters: true,
                    items: ['3', '5', '6', '9', '10', '11']
                },
                analog_pins: {
                    acceptReporters: true,
                    items: ['0', '1', '2', '3', '4', '5']
                },

                mode: {
                    acceptReporters: true,
                    items: [{ text: "Input", value: '1' }, { text: "Output", value: '2' }]
                },
                on_off: {
                    acceptReporters: true,
                    items: ['0', '1']
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
            value = parseInt(value, 10);

            // calculate the value based on percentage
            value = the_max * (value / 100);
            value = Math.round(value);
            if (pin_modes[pin] !== PWM) {
                pin_modes[pin] = PWM;
                msg = { "command": "set_mode_pwm", "pin": pin };
                msg = JSON.stringify(msg);
                this.socket.send(msg);
            }
            msg = { "command": "pwm_write", "pin": pin, "value": value };
            msg = JSON.stringify(msg);
            this.socket.send(msg);

        }
    }

    tone_on(args) {
        if (!connected) {
            if (!connection_pending) {
                this.connect();
                connection_pending = true;
            }
        }

        if (!connected) {
            let callbackEntry = [this.tone_on.bind(this), args];
            wait_open.push(callbackEntry);
        } else {
            let pin = args['PIN'];
            pin = parseInt(pin, 10);
            let freq = args['FREQ'];
            freq = parseInt(freq, 10);
            let duration = args['DURATION'];
            duration = parseInt(duration, 10);
            // make sure duration maximum is 5 seconds
            if (duration > 5000) {
                duration = 5000;
            }


            if (pin_modes[pin] !== TONE) {
                pin_modes[pin] = TONE;
                msg = { "command": "set_mode_tone", "pin": pin };
                msg = JSON.stringify(msg);
                this.socket.send(msg);
            }
            msg = { "command": "play_tone", "pin": pin, 'freq': freq, 'duration': duration };
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
            pin = parseInt(pin, 10);

            if (pin_modes[pin] !== DIGITAL_INPUT) {
                pin_modes[pin] = DIGITAL_INPUT;
                msg = { "command": "set_mode_digital_input", "pin": pin };
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
            msg = JSON.stringify({ "id": "to_arduino_gateway" });
            connect_attempt = true;
            if (this.runtime.ros && this.runtime.ros.isConnected()) {
                this.socket = new WebSocket(`ws://${this.runtime.vm.ros.ip}:9000`);
            }
            else{
                this.socket = new WebSocket(`ws://${window.location.hostname}:9000`);
            }
        }


        // websocket event handlers
        this.socket.onopen =  () => {

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
            connected = false
            connection_pending = false
            console.log('ws connection closed')
        };

        this.socket.onerror = (error) => {
            console.log(error)
            connected = false
            connection_pending = false
        }

        // reporter messages from the board
        this.socket.onmessage =  (message) => {
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

module.exports = Scratch3ArduinoOneGPIO;
