import { useCallback, useContext, useMemo } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useFetchDevLicense from 'calypso/a8c-for-agencies/data/purchases/use-fetch-dev-license';
import { MarketplaceTypeContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import { MARKETPLACE_TYPE_REFERRAL } from 'calypso/a8c-for-agencies/sections/marketplace/hoc/with-marketplace-type';
import { ShoppingCartItem } from '../types';

export default function useReferralDevSite(
	selectedCartItems: ShoppingCartItem[],
	setSelectedCartItems: ( items: ShoppingCartItem[] ) => void,
	referralBlogId?: number
) {
	const { data: allProducts, isLoading: isLoadingProducts } = useProductsQuery();
	const { data: license, isLoading: isLoadingLicense } = useFetchDevLicense( referralBlogId );
	const { setMarketplaceType } = useContext( MarketplaceTypeContext );

	const product = useMemo(
		() => allProducts?.find( ( p ) => p.product_id === license?.productId ),
		[ allProducts, license?.productId ]
	);

	const referralPlanAdded = useMemo(
		() => license && selectedCartItems.some( ( item ) => item.licenseId === license.licenseId ),
		[ selectedCartItems, license ]
	);

	const addReferralPlanToCart = useCallback( () => {
		if ( product && license && ! referralPlanAdded ) {
			setMarketplaceType( MARKETPLACE_TYPE_REFERRAL );

			const cartProduct: ShoppingCartItem = {
				...product,
				quantity: 1,
				licenseId: license.licenseId,
				siteUrls: [ license.siteUrl ],
			};

			setSelectedCartItems( [ cartProduct ] );
		}
	}, [ license, product, referralPlanAdded, setMarketplaceType, setSelectedCartItems ] );

	return { addReferralPlanToCart, isLoading: isLoadingProducts || isLoadingLicense };
}