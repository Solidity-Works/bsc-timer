github pages : https://thelambodan.github.io/bsc-timer/

This project is currently in alpha with a mainnet ready smart contract already deployed and tested on the testnet.

The Wallet Connect implementation is incomplete and is still being developed, but the site does work for metamask.

A mainnet contract has not yet been deployed as of the date of creation of this repository. 

The smart contract used for this project is not most efficient. By indexing orders, they can be stored in a simple
mapping of just one unnested linked list and be pointed to by other linked list mappings for incoming and outgoing
orders. This way, user addresses would just be mapped to store the various order numbers for orders involving their
addresses rather than the extra storage of extra linked list head information. 

Credits ->
            Joshua James = creator of UX and UI, smart contract contributor
            thelambodan = project creator, original contract developer, UX contributor
            Big Bo = contract developer, data flow manager
