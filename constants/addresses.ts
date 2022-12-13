export const ORIGIN_STORY_DROP =
    {
        1: '0xadd0a987a7de0c388ca34e82529f48ed008368a8',
        5: '0xbb7f40a0acce12356ade7f8d1ca8dff65a92a687',
    }[process.env.NEXT_PUBLIC_CHAIN_ID || 1] || ''

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
