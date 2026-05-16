import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconPicker } from './IconPicker';
import { LinkedInput } from './LinkedInput';
import { genId } from '@/lib/resumeStorage';
import type { Contact, IconName } from '@/types/resume';

interface ContactEditorProps {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
}

export function ContactEditor({ contacts, onChange }: ContactEditorProps) {
  function add() {
    onChange([...contacts, { id: genId(), icon: 'Mail', text: '', link: undefined }]);
  }

  function remove(id: string) {
    onChange(contacts.filter(c => c.id !== id));
  }

  function update(id: string, patch: Partial<Contact>) {
    onChange(contacts.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  return (
    <div className="flex flex-col gap-2">
      {contacts.map(contact => (
        <div key={contact.id} className="flex items-center gap-2">
          <IconPicker
            value={contact.icon as IconName}
            onChange={icon => update(contact.id, { icon })}
          />
          <LinkedInput
            value={contact.text}
            onChange={text => update(contact.id, { text })}
            link={contact.link}
            onLinkChange={link => update(contact.id, { link })}
            placeholder="Contact text..."
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => remove(contact.id)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Remove contact"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="self-start gap-1.5">
        <Plus className="h-4 w-4" /> Add Contact
      </Button>
    </div>
  );
}
