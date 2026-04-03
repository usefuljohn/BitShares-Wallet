const { v4: uuidv4 } = require('uuid');

let run = async function () { 

    const trx = {
        actions: [
            {
                account: 'eosio',
                name: 'delegatebw',
                authorization: [{
                    actor: 'ACCOUNT_NAME', // change to your own account
                    permission: 'active',
                }],
                data: {
                    from: 'ACCOUNT_NAME',
                    receiver: 'ACCOUNT_NAME',                    stake_net_quantity: '1.0000 SYS',
                    stake_cpu_quantity: '1.0000 SYS',
                    transfer: false,
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