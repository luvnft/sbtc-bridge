import * as btc from '@scure/btc-signer';
import type { PeginRequestI, UtxoI } from '../../types/pegin_request'
import { hex } from '@scure/base';
import { approxTxFees } from './tx_helper'
import { fetchUtxoSet, fetchCurrentFeeRates, fetchTransaction } from "../bridge_api";
import { toStorable } from '$lib/utils'
export default class ReclaimTransaction {
	tx:any;
	addressInfo:any;
	btcFeeRates:any;
	commitTx:PeginRequestI;
	transaction:any;
	feeInfo:any;
	fee = 500;
	net:any;
	fees: Array<number> = [];
	scureFee = 0;

	public constructor(commitTx:PeginRequestI) {
		(commitTx.sbtcWalletAddress.startsWith('tb')) ? this.net = btc.TEST_NETWORK : this.net = btc.NETWORK;
		this.commitTx = commitTx;
	}
 
	fetchUtxos = async ():Promise<boolean> => {
		this.addressInfo = await fetchUtxoSet(this.commitTx.fromBtcAddress);
		this.transaction = await fetchTransaction(this.commitTx.btcTxid as string);
		const btcFeeRates = await fetchCurrentFeeRates();
		this.feeInfo = btcFeeRates.feeInfo;
		return true;
	};

	setAmount = (amount:number) => {
		// overridden
		console.log(amount);
	};

	calculateFees = ():void => {
		this.scureFee = approxTxFees(this.addressInfo.utxos, this.commitTx.fromBtcAddress, 'tb1pf74xr0x574farj55t4hhfvv0vpc9mpgerasawmf5zk9suauckugqdppqe8');
		this.fees = [
			this.scureFee * 0.8, //Math.floor((this.feeInfo.low_fee_per_kb / 1000) * vsize),
			this.scureFee * 1.0, //Math.floor((this.feeInfo.medium_fee_per_kb / 1000) * vsize),
			this.scureFee * 1.2, //Math.floor((this.feeInfo.high_fee_per_kb / 1000) * vsize),
		]
		this.fee = this.fees[1];
	}

	buildTransaction = ():btc.Transaction => {
		//const txHex = await fetchTransaction(commitTx.btcTxid as string);
		this.tx = new btc.Transaction({ allowUnknowInput: true, allowUnknowOutput: true });
		const script = toStorable(this.commitTx.commitTxScript)
		if (!this.commitTx || !script) throw new Error('Incorrect data passed')
		if (!this.commitTx.btcTxid) this.commitTx.btcTxid = '72d1cebc1bb22757f549063926006f680fd5cb9e3388a214244735d8dd124533'
		if (script.paymentType === 'wsh') {
			if (!script.witnessScript) throw new Error('Incorrect data passed')
			//const txHex = await fetchTransactionHex(commitTx.btcTxid);
			//const script = btc.RawTx.decode(hex.decode(txHex));
			//const script = btc.RawTx.decode(hex.decode(utxo.tx.hex))
			const nextI:btc.TransactionInput = {
				txid: hex.decode(this.commitTx.btcTxid),
				index: 0,
				witnessScript: (script.witnessScript as Uint8Array),
				witnessUtxo: {
					script: (script.script as Uint8Array), //(this.pegInData.requestData.commitTxScript.witnessScript),
					amount: BigInt(this.commitTx.amount)
				}
			}
			console.log('nextI: ', nextI)
			this.tx.addInput(nextI);
		} else if (script.paymentType === 'tr') {
			if (!script.tapMerkleRoot) throw new Error('Incorrect data passed')
			if (!script.tapInternalKey) throw new Error('Incorrect data passed')
			const sbtcWalletAddrScript = btc.Address(this.net).decode(this.commitTx.sbtcWalletAddress)
			if (sbtcWalletAddrScript.type !== 'tr') throw new Error('Taproot required')
			const nextI:btc.TransactionInput = {
				txid: hex.decode(this.commitTx.btcTxid),
				index: 0,
				sighashType: btc.SignatureHash.ALL,
				//nonWitnessUtxo: (txHex),
				//tapBip32Derivation: script.leaves[0], //[script.leaves],
				//tapBip32Derivation: [script.tapInternalKey as Uint8Array, {
				//	hashes: script.leaves[0].hash,
				//}],
				tapInternalKey: (script.tapInternalKey as Uint8Array),
				tapLeafScript: script.tapLeafScript,
				// [{
				//		//version: script.tapLeafScript[0][0].version as number,
				//		internalKey: script.tapLeafScript[0][0].internalKey as Uint8Array,
				//		merklePath: script.tapLeafScript[0][0].merklePath,
				//	
				//}, script.tapLeafScript[0][1]],
				tapMerkleRoot: (script.tapMerkleRoot as Uint8Array),
				
				//witnessScript: (script.leaves[1].script as Uint8Array),
				//witnessUtxo: {
				//	script: (script.leaves[1].script as Uint8Array), //(this.pegInData.requestData.commitTxScript.witnessScript),
				//	amount: BigInt(commitTx.amount)
				//}
			}
			console.log('nextI: ', nextI)
			this.tx.addInput(nextI);
		}

		const feeUtxo = this.addInputForFee();
		const amount = this.commitTx.amount + feeUtxo?.value - this.fee;
		this.tx.addOutputAddress(this.commitTx.sbtcWalletAddress, BigInt(amount), this.net);
		//this.tx.finalize();

		return this.tx;
	}

	private addInputForFee = () => {
		const feeUtxo = this.addressInfo.utxos.find((utxo:UtxoI) => utxo.value > this.fee)
		const script = btc.RawTx.decode(hex.decode(feeUtxo.tx.hex))
		this.tx.addInput({
			txid: hex.decode(feeUtxo.txid),
			index: feeUtxo.vout,
			witnessUtxo: {
				script: script.outputs[feeUtxo.vout].script,
				amount: BigInt(feeUtxo.value)
			}
		});
		return feeUtxo;
	}
};