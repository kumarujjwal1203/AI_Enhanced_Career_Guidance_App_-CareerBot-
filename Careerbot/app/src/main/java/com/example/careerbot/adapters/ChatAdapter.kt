package com.example.careerbot.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.careerbot.R
import com.example.careerbot.models.ChatMessage
import java.text.SimpleDateFormat
import java.util.*

class ChatAdapter(private val items: MutableList<ChatMessage>) :
	RecyclerView.Adapter<RecyclerView.ViewHolder>() {

	private companion object {
		const val VIEW_TYPE_AI = 0
		const val VIEW_TYPE_USER = 1
	}

	private class AiMessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
		val textMessage: TextView = view.findViewById(R.id.text_message)
		val timestampText: TextView = view.findViewById(R.id.timestampText)
	}

	private class UserMessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
		val textMessage: TextView = view.findViewById(R.id.text_message)
		val timestampText: TextView = view.findViewById(R.id.timestampText)
	}

	override fun getItemViewType(position: Int): Int {
		val sender = items.getOrNull(position)?.sender ?: return VIEW_TYPE_AI
		return if (sender.equals("user", ignoreCase = true)) VIEW_TYPE_USER else VIEW_TYPE_AI
	}

	override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
		val inflater = LayoutInflater.from(parent.context)
		return if (viewType == VIEW_TYPE_USER) {
			val view = inflater.inflate(R.layout.item_message_user, parent, false)
			UserMessageViewHolder(view)
		} else {
			val view = inflater.inflate(R.layout.item_message_ai, parent, false)
			AiMessageViewHolder(view)
		}
	}

	override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
		if (position < 0 || position >= items.size) return
		val msg = items[position]
		val safeText = msg.message.ifBlank { " " }

		// Format timestamp
		val displayTime = formatTimestamp(msg.timestamp)

		when (holder) {
			is UserMessageViewHolder -> {
				holder.textMessage.text = safeText
				holder.timestampText.text = displayTime
			}
			is AiMessageViewHolder -> {
				holder.textMessage.text = safeText
				holder.timestampText.text = displayTime
			}
		}
	}

	private fun formatTimestamp(timestamp: String?): String {
		if (timestamp.isNullOrEmpty()) {
			return SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
		}

		return try {
			// Assuming timestamp is in ISO format
			val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
			isoFormat.timeZone = TimeZone.getTimeZone("UTC")
			val date = isoFormat.parse(timestamp)
			val displayFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
			displayFormat.format(date ?: Date())
		} catch (e: Exception) {
			SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
		}
	}

	override fun getItemCount(): Int = items.size

	fun addMessage(message: ChatMessage) {
		val position = items.size
		items.add(message)
		notifyItemInserted(position)
		// Ensure UI refresh in all cases
		notifyDataSetChanged()
	}

	fun setMessages(list: List<ChatMessage>) {
		items.clear()
		items.addAll(list)
		notifyDataSetChanged()
	}

    /**
     * Remove the last message matching predicate.
     * returns true if removed.
     */
	fun removeLastIf(predicate: (ChatMessage) -> Boolean): Boolean {
		for (i in items.indices.reversed()) {
			if (predicate(items[i])) {
				val idx = i
				items.removeAt(idx)
				notifyItemRemoved(idx)
				return true
			}
		}
		return false
	}

	fun clear() {
		items.clear()
		notifyDataSetChanged()
	}
}
