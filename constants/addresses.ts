export const ORIGIN_STORY_DROP =
    {
        1: '0xbeff7dd438d3079f146b249552512baf7a1f8e75',
        5: '0xbb7f40a0acce12356ade7f8d1ca8dff65a92a687',
    }[process.env.NEXT_PUBLIC_CHAIN_ID || 1] || ''

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
