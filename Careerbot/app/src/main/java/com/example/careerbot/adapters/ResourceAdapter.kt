package com.example.careerbot.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.careerbot.R
import com.example.careerbot.models.ResourceItem
import com.google.android.material.card.MaterialCardView
import com.google.android.material.chip.Chip

class ResourceAdapter(
    private val resources: List<ResourceItem>,
    private val onItemClick: (ResourceItem) -> Unit
) : RecyclerView.Adapter<ResourceAdapter.ResourceViewHolder>() {

    class ResourceViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val cardView: MaterialCardView = itemView.findViewById(R.id.cardResource)
        val tvTitle: TextView = itemView.findViewById(R.id.tvResourceTitle)
        val tvDescription: TextView = itemView.findViewById(R.id.tvResourceDescription)
        val chipPlatform: Chip = itemView.findViewById(R.id.tvResourcePlatform)
        val chipDifficulty: Chip = itemView.findViewById(R.id.chipDifficulty)
        val chipPremium: Chip = itemView.findViewById(R.id.chipPremium)
        val layoutMeta: LinearLayout = itemView.findViewById(R.id.layoutMeta)
        val tvDuration: TextView = itemView.findViewById(R.id.tvDuration)
        val tvViews: TextView = itemView.findViewById(R.id.tvViews)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ResourceViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_resource, parent, false)
        return ResourceViewHolder(view)
    }

    override fun onBindViewHolder(holder: ResourceViewHolder, position: Int) {
        val resource = resources[position]
        holder.tvTitle.text = resource.title
        holder.tvDescription.text = resource.description
        holder.chipPlatform.text = resource.category
        
        // Set difficulty
        resource.difficulty?.let {
            holder.chipDifficulty.text = it
            holder.chipDifficulty.visibility = View.VISIBLE
        } ?: run {
            holder.chipDifficulty.visibility = View.GONE
        }
        
        // Show premium badge if premium
        holder.chipPremium.visibility = if (resource.isPremium) View.VISIBLE else View.GONE
        
        // Show duration and views if available
        val hasMeta = !resource.duration.isNullOrEmpty() || resource.viewCount > 0
        holder.layoutMeta.visibility = if (hasMeta) View.VISIBLE else View.GONE
        
        if (!resource.duration.isNullOrEmpty()) {
            holder.tvDuration.text = "⏱ ${resource.duration}"
            holder.tvDuration.visibility = View.VISIBLE
        } else {
            holder.tvDuration.visibility = View.GONE
        }
        
        if (resource.viewCount > 0) {
            holder.tvViews.text = "👁 ${formatViewCount(resource.viewCount)} views"
            holder.tvViews.visibility = View.VISIBLE
        } else {
            holder.tvViews.visibility = View.GONE
        }

        holder.cardView.setOnClickListener {
            onItemClick(resource)
        }
    }

    override fun getItemCount(): Int = resources.size
    
    private fun formatViewCount(count: Int): String {
        return when {
            count >= 1000000 -> "${count / 1000000.0}M"
            count >= 1000 -> "${count / 1000.0}K"
            else -> count.toString()
        }
    }
}

