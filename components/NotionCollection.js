import { FriendLinksCollection } from '@/components/FriendLinksCollection'
import { galleryVisibilityClassName } from '@/lib/notion/galleryVisibilityClassName'
import { getBlockValue } from 'notion-utils'

export const GALLERY_VISIBILITY_WRAPPER_CLASS =
  'notion-gallery-visibility-wrapper'

const getCollectionView = ({ block, ctx }) => {
  return block?.view_ids
    ?.map(viewId => {
      const record = ctx?.recordMap?.collection_view?.[viewId]
      const collectionView = getBlockValue(record)

      return (
        collectionView?.value?.value ||
        collectionView?.value ||
        collectionView ||
        record?.value?.value ||
        record?.value ||
        record
      )
    })
    .find(view => view?.type === 'gallery')
}

export default function NotionCollection(props) {
  const className = galleryVisibilityClassName(getCollectionView(props))
  const collection = <FriendLinksCollection {...props} />

  if (!className) return collection

  return (
    <div className={`${GALLERY_VISIBILITY_WRAPPER_CLASS} ${className}`}>
      {collection}
    </div>
  )
}
