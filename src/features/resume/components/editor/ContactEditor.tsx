import * as React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { IconPicker } from './IconPicker';
import { LinkedInput } from './LinkedInput';
import { genId } from '@/lib/resumeStorage';
import type { Contact, IconName } from '@/types/resume';

interface SortableContactProps {
  contact: Contact;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Contact>) => void;
}

function SortableContact({ contact, onRemove, onUpdate }: SortableContactProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: contact.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <IconPicker
        value={contact.icon as IconName}
        onChange={icon => onUpdate(contact.id, { icon })}
      />
      <LinkedInput
        value={contact.text}
        onChange={text => onUpdate(contact.id, { text })}
        link={contact.link}
        onLinkChange={link => onUpdate(contact.id, { link })}
        placeholder="Contact text..."
        className="flex-1"
      />
      <button
        type="button"
        onClick={() => onRemove(contact.id)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        title="Remove contact"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ContactEditorProps {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
}

export function ContactEditor({ contacts, onChange }: ContactEditorProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function add() {
    onChange([...contacts, { id: genId(), icon: 'Mail', text: '', link: undefined }]);
  }

  function remove(id: string) {
    onChange(contacts.filter(c => c.id !== id));
  }

  function update(id: string, patch: Partial<Contact>) {
    onChange(contacts.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = contacts.findIndex(c => c.id === active.id);
      const newIndex = contacts.findIndex(c => c.id === over.id);
      onChange(arrayMove(contacts, oldIndex, newIndex));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={contacts.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {contacts.map(contact => (
            <SortableContact
              key={contact.id}
              contact={contact}
              onRemove={remove}
              onUpdate={update}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button variant="outline" size="sm" onClick={add} className="self-start gap-1.5">
        <Plus className="h-4 w-4" /> Add Contact
      </Button>
    </div>
  );
}
