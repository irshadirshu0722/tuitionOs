// components/TableRow.js
import { PencilSquareIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/solid';

export default function TableRow({ student, onEdit, onDelete, onMore }) {
  return (
    <tr className="border-t">
      <td className="px-4 py-4">{student.id}</td>
      <td className="px-4 py-4">{student.name}</td>
      <td className="px-4 py-4">{student.phone}</td>
      <td className="px-4 py-4">{student.address}</td>
      <td className="px-4 py-4 flex gap-2">
        <button onClick={onEdit}><PencilSquareIcon className="w-5 h-5 text-blue-500" /></button>
        <button onClick={onDelete}><TrashIcon className="w-5 h-5 text-red-500" /></button>
        <button onClick={onMore}><EllipsisVerticalIcon className="w-5 h-5 text-gray-500" /></button>
      </td>
    </tr>
  );
}