const Tag = ({ tag }: { tag: string }) => {
  return (
    <span
      className={
        tag === "Standard"
          ? "bg-gray-300 text-gray-800 border border-gray-500 rounded-xl text-xs font-semibold px-1 py-0.5 ml-1"
          : "bg-yellow-200 text-yellow-800 border border-yellow-500 rounded-xl text-xs font-semibold px-1 py-0.5 ml-1"
      }
    >
      {tag}
    </span>
  );
};

export {Tag};
