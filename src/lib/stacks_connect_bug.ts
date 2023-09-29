
import { bytesToHex } from '@stacks/common';
import {
	createStacksPrivateKey,
	getPublicKey,
	publicKeyToString,
	signMessageHashRsv,
  } from '@stacks/transactions';
import { sha256 } from '@noble/hashes/sha256';
import { hex } from '@scure/base';

export const keyChain = {
	"mnemonic": "foster raise devote wear great volcano spring chapter among violin bleak syrup rent sphere coyote client govern spirit good risk cruise twice trick jealous",
	"keyInfo": {
	  "privateKey": "b9a2ed36c4ba45e0cb610281dbbed9082d861b3523792b254afcb111af8765e801",
	  "publicKey": "03b5c5e9e5dee7b2237cd1b03583f410c0d784b9fd7906440f11d089ef6a4315de",
	  "address": "ST2GEN9CVCJNZPDH7Z7NPWRG6Z67GH3WWYAS4DGRA",
	  "btcAddress": "mvBoWJKijz38oTSJphUVNwRAkXtbJa6cUg",
	  "wif": "cToZ7x3Ju96xHxS8ZuEFmGxqMWJDbAQWsUgh48CG5zgtkzt1yRJj",
	  "index": 0
	}
}
const keyChainTM = {
	mnemonic: "tongue share ketchup verb online render syrup foam sock dice word indoor immune main shy parrot private roof weasel good nasty depth brass latin",
	wif: "cTUr9E29ZSU7DM2BZasiRbosSSaTxkweFDDgALq9X4HTTfeLgHj7",
	private_key: "b00359f021f31a172d0f1bdce77ff8484d826b26dcb8a87149ad0158a7fa076b",
	public_key: "0x0219d8b596270530a70ab714e3df1e2c9dc47f2c4a58f764e8d6e30f71eb5be3e4",
	stacks_address: "ST16DSD4NMCS0F1JTPR88114A9YPC86X2SM4D9K52",
	bitcoin_taproot_address_tweaked: "tb1pe5awed3ly579dg4arvfjclqwqagcvys94j4jnfzz9x0m5097yaqqp3fd47",
	bitcoin_taproot_address_untweaked: "tb1pr8vtt938q5c2wz4hzn3a783vnhz87tz2trmkf6xkuv8hr66mu0jqv889y5",
	bitcoin_p2pkh_address: "mnXN3WkULtwtVf9VvzxvwXWYbdBSYvLDb7"
}
export const address = 'ST2ACZ7DAH6EH20V36ES9SJEERBX7VWGWV0YB91PG'
export const btcAddress = 'mu5o1rDdfP6g8NKa1RweQDo1zQT58KWjdR'

export function signMessageDirect(message: string) {
	const privK = createStacksPrivateKey(keyChainTM.private_key)
	//const utf8Bytes = utf8ToBytes('0xdeadbeef')

	const arr = new Uint8Array([0xde, 0xad, 0xbe, 0xef])

	const hash = sha256(arr);
	//const hash = hashMessage(message); //hashMessage(message, '');
	console.log('hash: ' + hex.encode(hash))
	return {
	  signature: signMessageHashRsv({ privateKey: privK, messageHash: bytesToHex(hash) }).data,
	  publicKey: publicKeyToString(getPublicKey(privK)),
	};
}

