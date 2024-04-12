class Menu {

    static formatMenu(menu, start = 0) {
        var items = [{
            text: ' ',
            value: ' '
        }]
        if (menu && menu.length > 0) {
            items = menu.map((item, index) => {
                return {
                    text: item,
                    value: (index + start).toString()
                }
            })
        }

        return items
        return {
            acceptReporters: true,
            items: items
        }
    }
    static formatMenu2(menu) {
        // console.log(menu, menu.length)
        var items = [{
            text: ' ',
            value: ' '
        }]
        if (menu && menu.length > 0) {
            items = menu.map((item, index) => {
                return {
                    text: item,
                    value: item
                }
            })
        }
        return items
    }

    static formatMenu3(texts, values) {
        var items = [{
            text: ' ',
            value: ' '
        }]
        if (texts.length + values.length > 0 && texts.length == values.length) {
            items = texts.map((item, index) => {
                return {
                    text: item,
                    value: values[index]
                }
            })
        }
        return items
    }
    static formatMenu4(length, start = 0) {
        var items = [{
            text: ' ',
            value: ' '
        }]
        if (length >= 1) {
            items = []
            for (let i = 0; i < length; i++) {
                items.push({
                    text: '' + (i + start),
                    value: ''+(i + start)
                })
            }
        }
        return items
    }
}

// 玄学，在turbo warp环境下不加这条语句 调用会失败.????
Menu.formatMenu(['M1', 'M2', 'M3', 'M4', 'M5'], start = 1)

module.exports = Menu