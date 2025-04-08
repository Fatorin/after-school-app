'use client'

import { useEffect } from 'react';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { useCrud } from '@/hooks/use-crud';
import { Member, memberColumns, memberSchema, MemberSchemaShape, MemberUpsertRequest } from '@/types/member';
import { createFormStore } from '@/stores/form-store';
import { Me } from '@/types/me';
import { API_PATH } from '@/lib/api/common';

export function MemberList({ me }: { me: Me | null }) {
  const {
    items,
    initialized,
    isLoading,
    fetchItems,
    handleInsert,
    handleUpdate,
    handleDelete
  } = useCrud<Member, MemberUpsertRequest>({
    basePath: API_PATH.members,
    dateFields: {
      birth_date: true,
      joined_at: true
    }
  });

  const formStore = createFormStore(memberSchema);

  useEffect(() => {
    if (!initialized) {
      fetchItems().catch(console.error);
    }
  }, [fetchItems, initialized]);

  const permissionConfig = {
    canEdit: (member: Member) => {
      if (!me) return false;
      if (me.role === 'super_admin') return true;
      return me.role === 'admin' && me.id === member.id;
    },
    canDelete: (member: Member) => {
      if (!me) return false;
      return (
        (me.role === 'admin' && me.id === member.id) ||
        (me.role === 'super_admin' && me.id !== member.id)
      );
    }
  };

  return (
    <GenericDataTable<Member, MemberSchemaShape>
      data={items}
      columns={memberColumns}
      viewConfig={{
        enablePreviewMode: true,
        defaultViewMode: 'list'
      }}
      permissionConfig={permissionConfig}
      userRole={me?.role || 'user'}
      onInsert={handleInsert}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      isLoading={isLoading}
      formStore={formStore} />
  );
}