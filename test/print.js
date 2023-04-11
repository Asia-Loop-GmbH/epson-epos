window.alPrintReceipts = async function (order, koch, storeConfiguration) {
    console.log(`EPSON: print order ${order.orderNumber} with store configuration ${JSON.stringify(storeConfiguration)}`)

    if (!storeConfiguration.epsonReceiptPrinterIp) {
        console.log('EPSON: no printer configured. Skip print.')
        return Promise.resolve()
    }

    let printer = null;
    const ePosDev = new epson.ePOSDevice();
    ePosDev.connect(storeConfiguration.epsonReceiptPrinterIp, 8008, cbConnect);
    function cbConnect(data) {
        if (data === 'OK') {
            console.log("EPSON connected")
            ePosDev.createDevice('local_printer', ePosDev.DEVICE_TYPE_PRINTER, {'crypto' : true, 'buffer' : true}, cbCreateDevice_printer);
        } else {
            console.error("Failed to connect EPSON")
            console.log(data);
        }
    }
    function cbCreateDevice_printer(devobj, retcode) {
        if( retcode === 'OK' ) {
            console.log("EPSON got device")
            printer = devobj;
            executeAddedCode();
        } else {
            console.error("Failed to get EPSON device")
            console.log(retcode);
        }
    }

    function resetText() {
        printer.addTextSize(1, 1)
        printer.addTextSmooth(false)
        printer.addTextFont(printer.FONT_A)
        printer.addTextStyle()
    }

    function executeAddedCode() {
        koch.forEach(receipt => {
            printer.addFeed()
            printer.addFeed()
            printer.addFeed()
            printer.addFeed()
            printer.addFeed()
            printer.addFeed()

            printer.addTextAlign(printer.ALIGN_CENTER)
            printer.addTextStyle(false, false, true)
            printer.addTextFont(printer.FONT_B)
            printer.addTextSize(2, 2)
            printer.addTextSmooth(true)
            printer.addText(`[${receipt.positionType}] ${receipt.orderNumber}\n`)
            resetText()

            printer.addTextAlign(printer.ALIGN_CENTER)
            printer.addTextStyle(false, false, true)
            printer.addText(`${receipt.fullName}\n`)
            resetText()

            printer.addTextAlign(printer.ALIGN_RIGHT)
            printer.addTextStyle(false, false, false)
            printer.addText(`${receipt.orderTime}\n`)
            resetText()

            printer.addTextAlign(printer.ALIGN_CENTER)
            printer.addTextStyle(false, false, true)
            printer.addText(`[${receipt.deliveryMethod}] ${receipt.deliveryTime}\n\n\n`)
            resetText()

            if (receipt.notice) {
                printer.addTextAlign(printer.ALIGN_CENTER)
                printer.addTextSize(2, 2)
                printer.addTextSmooth(true)
                printer.addTextFont(printer.FONT_C)
                printer.addText(`\n${receipt.notice}\n\n`)
                resetText()
            }

            receipt.rawItems.filter(item => {
                return ["GS", "_"].every(prefix => !item.sku.startsWith(prefix))
            }).forEach(item => {
                printer.addTextAlign(printer.ALIGN_LEFT)
                printer.addText(`${item.quantity}x`)
                printer.addText(` [${item.sku}] `)
                printer.addTextStyle()
                printer.addText(`${item.name}\n`)
                item.extra && item.extra.forEach(e => {
                    printer.addText(`\t${e.value}\n`)
                })
                printer.addFeed()
                resetText()
            })


            printer.addFeed()
            printer.addFeed()
            printer.addCut(printer.CUT_FEED)
        })

        printer.send();
    }
}
