export default class HexUtils {

    /**
    * 二进制数据转16进制
    */
    static bytesToHexStr = (bytes) => {
        const hexArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
        let hexChars = [];
        let j = 0;
        for (j = 0; j < bytes.length; j++) {
            let v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        let hexStr = hexChars.toString();
        var oReg = new RegExp(',', "g");
        let hexValue = hexStr.replace(oReg, '');
        return hexValue;
    }

    static base64ToArrayBuffer = (base64) => {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    //字符串转byte数组
    static stringToByte = (str) => {
        var bytes = new Array();
        var len, c;
        len = str.length;
        for (var i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if (c >= 0x010000 && c <= 0x10FFFF) {
                bytes.push(((c >> 18) & 0x07) | 0xF0);
                bytes.push(((c >> 12) & 0x3F) | 0x80);
                bytes.push(((c >> 6) & 0x3F) | 0x80);
                bytes.push((c & 0x3F) | 0x80);
            } else if (c >= 0x000800 && c <= 0x00FFFF) {
                bytes.push(((c >> 12) & 0x0F) | 0xE0);
                bytes.push(((c >> 6) & 0x3F) | 0x80);
                bytes.push((c & 0x3F) | 0x80);
            } else if (c >= 0x000080 && c <= 0x0007FF) {
                bytes.push(((c >> 6) & 0x1F) | 0xC0);
                bytes.push((c & 0x3F) | 0x80);
            } else {
                bytes.push(c & 0xFF);
            }
        }
        return bytes;
    }


    static string2Bin = (s) => {
        var b = new Array();
        var last = s.length;

        for (var i = 0; i < last; i++) {
            var d = s.charCodeAt(i);
            if (d < 128)
                b[i] = dec2Bin(d);
            else {
                var c = s.charAt(i);
                alert(c + ' is NOT an ASCII character');
                b[i] = -1;
            }
        }
        return b;
    }

    static dec2Bin = (s) => {
        var b = '';

        for (var i = 0; i < 8; i++) {
            b = (d % 2) + b;
            d = Math.floor(d / 2);
        }

        return b;
    }

}



