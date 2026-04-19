import { AttachmentMetadataDto, OutboundChatMessage } from "@/api";
import { useClickAway } from "@/hooks/useClickAway";
import { FC, useState } from "react";
import { Icon } from "./Icon";
import { API_LOCATION } from "@/config";
import { formatSize } from "@/utils";
import { LoadingSpinner } from "./LoadingSpinner";

type MessageProps = {
  message: OutboundChatMessage;
  currentUser: string;
  startEditingMessage: (message: OutboundChatMessage) => void;
  onDeleteMessage: (message: OutboundChatMessage) => void;
  onDeleteAttachment: (attachment: AttachmentMetadataDto) => void;
};
export const Message: FC<MessageProps> = (props) => {
  const { message, currentUser, startEditingMessage, onDeleteMessage, onDeleteAttachment } = props;
  const isSelf = message.author === currentUser;
  const [isSelected, setIsSelected] = useState(false);
  const onClickContextMenu = useClickAway((_event, inside) => setIsSelected(inside));
  return (
    <div className={`flex mb-2 ${isSelf ? "self-end text-white" : "items-start text-black"}`}>
      <div className={`rounded-lg p-2 md:max-w-xl max-w-sm ${isSelf ? "bg-blue-500" : "bg-gray-200"}`}>
        <div className={`relative text-sm font-semibold flex ${isSelf ? "justify-end" : "justify-start"}`}>
          {isSelected && (
            <div className="message-context-menu absolute right-5 bottom-0 w-48 bg-white rounded-md shadow-lg z-20">
              <ul className="py-1">
                <p
                  className="block text-sm px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                  onClick={() => startEditingMessage(message)}
                >
                  Edit message
                </p>
                <p
                  className="block text-sm px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                  onClick={() => onDeleteMessage(message)}
                >
                  Delete message
                </p>
              </ul>
            </div>
          )}
          <div>
            <span>{isSelf ? "You" : message.author}</span>
            <span className={`text-xs pl-2 font-normal ${isSelf ? "text-gray-200" : "text-gray-500"}`}>
              {message.timestamp.split("T")[0]}
            </span>
          </div>
          {isSelf && (
            <Icon name="more_vert" className="text-base pl-2 font-normal cursor-pointer font-semibold" onClick={onClickContextMenu} />
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        {message.attachments.map((attachment, i) => (
          <MessageAttachment key={i} attachment={attachment} onDeleteAttachment={onDeleteAttachment} />
        ))}
      </div>
    </div>
  );
};

type AttachmentImageProps = { attachment: AttachmentMetadataDto };
export const AttachmentImage: React.FC<AttachmentImageProps> = (props) => {
  const { attachment } = props;
  const [imageLoading, setImageLoading] = useState(true);
  return (
    <div style={{ position: "relative" }}>
      <img
        className="rounded-lg mt-0.5"
        alt={attachment.filename}
        src={`${API_LOCATION}/attachment/get/${attachment.id}`}
        onLoad={() => setImageLoading(false)}
      />
      {imageLoading && (
        <LoadingSpinner style={{ position: "absolute", top: "50%", left: "50%", color: "black", transform: "translate(-50%, -50%)" }} />
      )}
    </div>
  );
};

type NewAttachmentProps = {
  attachment: { filename: string; size: number };
  onRemove: () => void;
};
export const NewAttachment: React.FC<NewAttachmentProps> = (props) => {
  const { attachment, onRemove } = props;
  return (
    <div className="input-attachment-component flex items-center mr-2 p-1 text-xs bg-gray-200 rounded-lg">
      <Icon name="insert_drive_file" className="text-blue-500 mr-2 text-2xl" />
      <div className="flex flex-col min-w-48">
        <span className="text-gray-800">{attachment.filename}</span>
        <span className="text-gray-500">{formatSize(attachment.size)}</span>
      </div>
      <button className="p-1 mr-0.5 rounded-full hover:bg-gray-200 flex items-center" onClick={onRemove}>
        <Icon name="cancel" className="text-red-500 text-lg" />
      </button>
    </div>
  );
};

type MessageAttachmentProps = {
  attachment: AttachmentMetadataDto;
  onDeleteAttachment: (attachment: AttachmentMetadataDto) => void;
};
const MessageAttachment: React.FC<MessageAttachmentProps> = (props) => {
  const { attachment, onDeleteAttachment } = props;
  return (
    <div className="message-attachment-component mt-2 bg-white p-2 rounded-lg shadow-lg text-xs flex flex-col">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center mr-4">
          <Icon name="insert_drive_file" className="text-blue-500 mr-2 text-2xl" />
          <div className="flex flex-col min-w-48">
            <span className="text-gray-800">{attachment.filename}</span>
            <span className="text-gray-500">{formatSize(attachment.size)}</span>
          </div>
        </div>
        <div className="flex items-center">
          <button className="p-1 mr-0.5 rounded-full hover:bg-gray-200 flex items-center" onClick={() => onDeleteAttachment(attachment)}>
            <Icon name="delete" className="text-gray-800 text-lg" />
          </button>
          <a
            className="p-1 rounded-full hover:bg-gray-200 flex items-center"
            href={`${API_LOCATION}/attachment/get/${attachment.id}`}
            download={attachment.filename}
          >
            <Icon name="download" className="text-gray-800 text-lg" />
          </a>
        </div>
      </div>
      {attachment.contentType.startsWith("image/") && <AttachmentImage attachment={attachment} />}
    </div>
  );
};
