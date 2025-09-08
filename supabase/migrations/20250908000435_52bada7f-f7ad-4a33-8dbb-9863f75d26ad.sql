-- Update crypto wallet addresses with new ones
UPDATE public.crypto_wallets SET 
  wallet_address = 'bc1qfxysnccdh3fsfvjke5c9xf8fht8p56nshhpm02'
WHERE crypto_symbol = 'BTC';

UPDATE public.crypto_wallets SET 
  wallet_address = '0xFCE5f8B626De1631fdF3BFC61672DC5CD94C1d67'
WHERE crypto_symbol = 'ETH';

UPDATE public.crypto_wallets SET 
  wallet_address = '0xFCE5f8B626De1631fdF3BFC61672DC5CD94C1d67',
  network = 'Ethereum (ERC-20)'
WHERE crypto_symbol = 'USDT';

UPDATE public.crypto_wallets SET 
  wallet_address = '0xFCE5f8B626De1631fdF3BFC61672DC5CD94C1d67',
  crypto_name = 'Binance Coin (BEP-20)',
  network = 'BNB Smart Chain (BSC)'
WHERE crypto_symbol = 'BNB';

UPDATE public.crypto_wallets SET 
  wallet_address = 'addr1qxu67y0af4k9nqzhqhzwcrfz5uy3ntx9j8q8d55wkfrskhyrkr7p39hgp57j89ezz6lykl09uyx8v4n9vw5aq4ejwtjqdwh5d0'
WHERE crypto_symbol = 'ADA';