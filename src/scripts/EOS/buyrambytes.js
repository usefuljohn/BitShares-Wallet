const { v4: uuidv4 } = require('uuid');

let run = async function () { 

    const trx = {
        actions: [
            {
                account: 'eosio',
                name: 'buyrambytes',
                authorization: [{
                    actor: 'ACCOUNT_NAME',
                    permission: 'active',
                }],
                data: {
                    payer: 'ACCOUNT_NAME',
                    receiver: 'ACCOUNT_NAME',
                    bytes: 8192,
                },
            }
        ]
    }
    
    const request = {
        type: "api",
        id: await uuidv4(),
        payload: {
            method: "injectedCall",
            params: ["signAndBroadcast", JSON.stringify(trx), []],
            appName: "An EOS raw deeplink script",
            chain: "EOS",
            browser: "web browser",
            origin: "localhost",
        },
    };
    
    let encodedPayload;
    try {
        encodedPayload = encodeURIComponent(JSON.stringify(request));
    } catch (error) {
        console.log(error);
    }

    console.log(`rawvaulta://api?chain=EOS&request=${encodedPayload}`);
    process.exit(0);
}

run();